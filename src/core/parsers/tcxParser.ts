/**
 * TCX 格式解析器
 * 使用浏览器原生 DOMParser 解析 TCX XML
 *
 * TCX (Training Center XML) 是 Garmin Training Center 格式。
 * 相比 GPX，TCX 支持圈（Lap）、心率、配速等训练数据。
 */

import type { Parser, UnifiedActivity, TrackPoint, Lap, Sport } from '../types'

const NS = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2'

export const tcxParser: Parser = {
  format: 'TCX',
  async parse(data: ArrayBuffer | string): Promise<UnifiedActivity> {
    const xmlStr = typeof data === 'string' ? data : new TextDecoder().decode(data)
    const dom = new DOMParser().parseFromString(xmlStr, 'text/xml')

    const parseError = dom.querySelector('parsererror')
    if (parseError) {
      throw new Error('TCX 文件解析失败：XML 格式错误')
    }

    const tcd = dom.documentElement
    if (!tcd || tcd.tagName !== 'TrainingCenterDatabase') {
      throw new Error('不是有效的 TCX 文件：根元素不是 <TrainingCenterDatabase>')
    }

    const activityEl = tcd.getElementsByTagNameNS(NS, 'Activity')[0]
    if (!activityEl) {
      throw new Error('TCX 文件中未找到 <Activity> 元素')
    }

    const sport = mapSport(activityEl.getAttribute('Sport') || '')

    // Activity Id (开始时间)
    const idEl = activityEl.getElementsByTagNameNS(NS, 'Id')[0]
    const startTime = idEl?.textContent ? Date.parse(idEl.textContent.trim()) : undefined

    // 解析所有 Lap
    const lapEls = activityEl.getElementsByTagNameNS(NS, 'Lap')
    const laps: Lap[] = []
    const allPoints: TrackPoint[] = []

    for (let i = 0; i < lapEls.length; i++) {
      const lapEl = lapEls[i]
      const lap = parseLap(lapEl)
      laps.push(lap)
      allPoints.push(...lap.points)
    }

    // 如果没有 Lap，尝试直接找 Trackpoint
    if (allPoints.length === 0) {
      const tpEls = activityEl.getElementsByTagNameNS(NS, 'Trackpoint')
      for (let i = 0; i < tpEls.length; i++) {
        const pt = parseTrackpoint(tpEls[i])
        if (pt) allPoints.push(pt)
      }
    }

    // 提取汇总数据（从第一个 Lap 或 Activity 级别）
    let totalTime: number | undefined
    let totalDistance: number | undefined
    let calories: number | undefined
    if (laps[0]) {
      totalTime = laps[0].totalTime
      totalDistance = laps[0].distance
    }
    const calEl = activityEl.getElementsByTagNameNS(NS, 'Calories')[0]
    if (calEl?.textContent) {
      calories = parseInt(calEl.textContent.trim(), 10)
    }

    // 累加所有 lap 的时长和距离
    if (laps.length > 0) {
      totalTime = laps.reduce((sum, l) => sum + (l.totalTime || 0), 0)
      totalDistance = laps.reduce((sum, l) => sum + (l.distance || 0), 0)
    }

    // 平均/最大心率
    const hrs = allPoints.map(p => p.hr).filter((h): h is number => h !== undefined)
    const avgHr = hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : undefined
    const maxHr = hrs.length ? Math.max(...hrs) : undefined

    return {
      sport,
      startTime: !isNaN(startTime as number) ? startTime : undefined,
      totalTime,
      totalDistance,
      calories,
      avgHr,
      maxHr,
      points: allPoints,
      laps: laps.length > 0 ? laps : undefined,
    }
  },
}

/** 解析 <Lap> 元素 */
function parseLap(lapEl: Element): Lap {
  const startTimeStr = lapEl.getAttribute('StartTime')
  const startTime = startTimeStr ? Date.parse(startTimeStr) : undefined

  const totalTimeEl = lapEl.getElementsByTagNameNS(NS, 'TotalTimeSeconds')[0]
  const totalTime = totalTimeEl?.textContent ? parseFloat(totalTimeEl.textContent.trim()) : undefined

  const distEl = lapEl.getElementsByTagNameNS(NS, 'DistanceMeters')[0]
  const distance = distEl?.textContent ? parseFloat(distEl.textContent.trim()) : undefined

  const avgHrEl = lapEl.getElementsByTagNameNS(NS, 'AverageHeartRateBpm')[0]
  const avgHr = avgHrEl ? parseHr(avgHrEl) : undefined

  const maxHrEl = lapEl.getElementsByTagNameNS(NS, 'MaximumHeartRateBpm')[0]
  const maxHr = maxHrEl ? parseHr(maxHrEl) : undefined

  // 解析 Track 下的 Trackpoint
  const points: TrackPoint[] = []
  const tpEls = lapEl.getElementsByTagNameNS(NS, 'Trackpoint')
  for (let i = 0; i < tpEls.length; i++) {
    const pt = parseTrackpoint(tpEls[i])
    if (pt) points.push(pt)
  }

  return {
    startTime: !isNaN(startTime as number) ? startTime : undefined,
    totalTime: !isNaN(totalTime as number) ? totalTime : undefined,
    distance: !isNaN(distance as number) ? distance : undefined,
    avgHr,
    maxHr,
    points,
  }
}

/** 解析 <Trackpoint> 元素 */
function parseTrackpoint(tpEl: Element): TrackPoint | null {
  const timeEl = tpEl.getElementsByTagNameNS(NS, 'Time')[0]
  const time = timeEl?.textContent ? Date.parse(timeEl.textContent.trim()) : undefined

  const posEl = tpEl.getElementsByTagNameNS(NS, 'Position')[0]
  if (!posEl) return null

  const latEl = posEl.getElementsByTagNameNS(NS, 'LatitudeDegrees')[0]
  const lngEl = posEl.getElementsByTagNameNS(NS, 'LongitudeDegrees')[0]
  const lat = latEl?.textContent ? parseFloat(latEl.textContent.trim()) : NaN
  const lng = lngEl?.textContent ? parseFloat(lngEl.textContent.trim()) : NaN
  if (isNaN(lat) || isNaN(lng)) return null

  const point: TrackPoint = { lat, lng }
  if (!isNaN(time as number)) point.time = time

  const altEl = tpEl.getElementsByTagNameNS(NS, 'AltitudeMeters')[0]
  if (altEl?.textContent) {
    const ele = parseFloat(altEl.textContent.trim())
    if (!isNaN(ele)) point.ele = ele
  }

  const hrEl = tpEl.getElementsByTagNameNS(NS, 'HeartRateBpm')[0]
  if (hrEl) {
    const hr = parseHr(hrEl)
    if (hr !== undefined) point.hr = hr
  }

  const cadEl = tpEl.getElementsByTagNameNS(NS, 'Cadence')[0]
  if (cadEl?.textContent) {
    const cad = parseInt(cadEl.textContent.trim(), 10)
    if (!isNaN(cad)) point.cad = cad
  }

  // 扩展中的速度和功率
  const extEl = tpEl.getElementsByTagNameNS(NS, 'Extensions')[0]
  if (extEl) {
    const speedEl = extEl.getElementsByTagName('Speed')[0]
      || extEl.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'Speed')[0]
    if (speedEl?.textContent) {
      const speed = parseFloat(speedEl.textContent.trim())
      if (!isNaN(speed)) point.speed = speed
    }
    const powerEl = extEl.getElementsByTagName('Watts')[0]
      || extEl.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'Watts')[0]
    if (powerEl?.textContent) {
      const power = parseFloat(powerEl.textContent.trim())
      if (!isNaN(power)) point.power = power
    }
  }

  return point
}

/** 从 <HeartRateBpm><Value>150</Value></HeartRateBpm> 提取心率 */
function parseHr(el: Element): number | undefined {
  const valueEl = el.getElementsByTagNameNS(NS, 'Value')[0]
  if (valueEl?.textContent) {
    const hr = parseInt(valueEl.textContent.trim(), 10)
    if (!isNaN(hr)) return hr
  }
  return undefined
}

/** TCX Sport 属性 → 统一 Sport */
function mapSport(sport: string): Sport {
  const s = sport.toLowerCase()
  if (s.includes('run')) return 'running' as Sport
  if (s.includes('bike') || s.includes('cycl')) return 'cycling' as Sport
  if (s.includes('swim')) return 'swimming' as Sport
  if (s.includes('walk')) return 'walking' as Sport
  if (s.includes('hike')) return 'hiking' as Sport
  if (s.includes('tri')) return 'triathlon' as Sport
  return 'other' as Sport
}
