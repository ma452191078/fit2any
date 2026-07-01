/**
 * GPX 格式解析器
 * 使用浏览器原生 DOMParser 解析 GPX XML
 *
 * GPX 是通用 GPS 轨迹交换格式，基于 XML。
 * 标准 GPX 仅包含轨迹点（lat/lng/ele/time），不含心率等训练数据。
 */

import type { Parser, UnifiedActivity, TrackPoint, Sport } from '../types'

/** GPX 命名空间 */
const NS = 'http://www.topografix.com/GPX/1/1'

export const gpxParser: Parser = {
  format: 'GPX',
  async parse(data: ArrayBuffer | string): Promise<UnifiedActivity> {
    const xmlStr = typeof data === 'string' ? data : new TextDecoder().decode(data)
    const dom = new DOMParser().parseFromString(xmlStr, 'text/xml')

    // 检查解析错误
    const parseError = dom.querySelector('parsererror')
    if (parseError) {
      throw new Error('GPX 文件解析失败：XML 格式错误')
    }

    const gpx = dom.documentElement
    if (!gpx || gpx.tagName !== 'gpx') {
      throw new Error('不是有效的 GPX 文件：根元素不是 <gpx>')
    }

    const points: TrackPoint[] = []
    const trkSegs = gpx.getElementsByTagNameNS(NS, 'trkseg')

    // 遍历所有轨迹段
    for (let i = 0; i < trkSegs.length; i++) {
      const seg = trkSegs[i]
      const trkpts = seg.getElementsByTagNameNS(NS, 'trkpt')
      for (let j = 0; j < trkpts.length; j++) {
        const pt = parseTrkpt(trkpts[j])
        if (pt) points.push(pt)
      }
    }

    // 如果没有 trkseg，尝试直接找 trkpt
    if (points.length === 0) {
      const allPts = gpx.getElementsByTagNameNS(NS, 'trkpt')
      for (let i = 0; i < allPts.length; i++) {
        const pt = parseTrkpt(allPts[i])
        if (pt) points.push(pt)
      }
    }

    // 提取元信息
    const metadata = gpx.getElementsByTagNameNS(NS, 'metadata')[0]
    let startTime: number | undefined
    if (metadata) {
      const timeEl = metadata.getElementsByTagNameNS(NS, 'time')[0]
      if (timeEl?.textContent) {
        startTime = Date.parse(timeEl.textContent.trim())
      }
    }
    // 若元信息无时间，用第一个轨迹点的时间
    if (startTime === undefined && points[0]?.time) {
      startTime = points[0].time
    }

    // 尝试从 track name 推断运动类型
    const trkNameEl = gpx.getElementsByTagNameNS(NS, 'name')[0]
    const name = trkNameEl?.textContent?.trim() || ''

    return {
      sport: inferSport(name),
      startTime,
      totalTime: points.length > 1 && points[0].time && points[points.length - 1].time
        ? (points[points.length - 1].time! - points[0].time!) / 1000
        : undefined,
      points,
    }
  },
}

/** 解析单个 <trkpt> 元素 */
function parseTrkpt(el: Element): TrackPoint | null {
  const lat = parseFloat(el.getAttribute('lat') || '')
  const lng = parseFloat(el.getAttribute('lon') || '')
  if (isNaN(lat) || isNaN(lng)) return null

  const point: TrackPoint = { lat, lng }

  const eleEl = el.getElementsByTagNameNS(NS, 'ele')[0]
  if (eleEl?.textContent) {
    const ele = parseFloat(eleEl.textContent.trim())
    if (!isNaN(ele)) point.ele = ele
  }

  const timeEl = el.getElementsByTagNameNS(NS, 'time')[0]
  if (timeEl?.textContent) {
    const t = Date.parse(timeEl.textContent.trim())
    if (!isNaN(t)) point.time = t
  }

  // GPX 扩展：心率（部分设备会写入 gpxtpx:hr）
  const extEl = el.getElementsByTagNameNS(NS, 'extensions')[0]
  if (extEl) {
    const hrEl = extEl.getElementsByTagName('hr')[0]
      || extEl.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/TrackPointExtension/v1', 'hr')[0]
    if (hrEl?.textContent) {
      const hr = parseInt(hrEl.textContent.trim(), 10)
      if (!isNaN(hr)) point.hr = hr
    }
    const cadEl = extEl.getElementsByTagName('cad')[0]
      || extEl.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/TrackPointExtension/v1', 'cad')[0]
    if (cadEl?.textContent) {
      const cad = parseInt(cadEl.textContent.trim(), 10)
      if (!isNaN(cad)) point.cad = cad
    }
  }

  return point
}

/** 从名称推断运动类型 */
function inferSport(name: string): Sport {
  const n = name.toLowerCase()
  if (n.includes('run') || n.includes('跑')) return 'running' as Sport
  if (n.includes('ride') || n.includes('bike') || n.includes('cycl') || n.includes('骑')) return 'cycling' as Sport
  if (n.includes('swim') || n.includes('游')) return 'swimming' as Sport
  if (n.includes('hike') || n.includes('徒步')) return 'hiking' as Sport
  if (n.includes('walk') || n.includes('走')) return 'walking' as Sport
  return 'other' as Sport
}
