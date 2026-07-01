/**
 * TCX 格式生成器
 * 将 UnifiedActivity 序列化为 TCX XML
 *
 * TCX 支持轨迹、心率、配速、圈数等训练数据。
 */

import type { Writer, UnifiedActivity, TrackPoint, Lap, Sport } from '../types'

export const tcxWriter: Writer = {
  format: 'TCX',
  write(activity: UnifiedActivity): Blob {
    const xml = generateTcx(activity)
    return new Blob([xml], { type: 'application/vnd.garmin.tcx+xml;charset=utf-8' })
  },
}

const NS = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2'
const EXT_NS = 'http://www.garmin.com/xmlschemas/ActivityExtension/v2'

function generateTcx(activity: UnifiedActivity): string {
  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push(`<TrainingCenterDatabase xmlns="${NS}" xmlns:ext="${EXT_NS}">`)
  lines.push('  <Activities>')
  lines.push(`    <Activity Sport="${mapSport(activity.sport)}">`)
  lines.push(`      <Id>${toIso(activity.startTime ?? activity.points[0]?.time ?? Date.now())}</Id>`)

  // 生成 Lap —— 如果 lap.points 为空，回退到 activity.points
  const laps = activity.laps && activity.laps.length > 0
    ? activity.laps.map(l => l.points.length > 0 ? l : { ...l, points: activity.points })
    : [{ points: activity.points, totalTime: activity.totalTime, distance: activity.totalDistance }]

  for (const lap of laps) {
    lines.push(formatLap(lap, activity.startTime ?? activity.points[0]?.time))
  }

  lines.push('    </Activity>')
  lines.push('  </Activities>')
  lines.push('</TrainingCenterDatabase>')

  return lines.join('\n')
}

function formatLap(lap: Lap, fallbackStart?: number): string {
  const start = lap.startTime ?? fallbackStart ?? Date.now()
  const totalTime = lap.totalTime ?? 0
  const distance = lap.distance ?? 0
  const parts: string[] = []

  parts.push(`      <Lap StartTime="${toIso(start)}">`)
  parts.push(`        <TotalTimeSeconds>${totalTime}</TotalTimeSeconds>`)
  parts.push(`        <DistanceMeters>${distance}</DistanceMeters>`)
  if (lap.avgHr !== undefined) {
    parts.push('        <AverageHeartRateBpm>')
    parts.push(`          <Value>${lap.avgHr}</Value>`)
    parts.push('        </AverageHeartRateBpm>')
  }
  if (lap.maxHr !== undefined) {
    parts.push('        <MaximumHeartRateBpm>')
    parts.push(`          <Value>${lap.maxHr}</Value>`)
    parts.push('        </MaximumHeartRateBpm>')
  }
  parts.push('        <Intensity>Active</Intensity>')
  parts.push('        <TriggerMethod>Manual</TriggerMethod>')
  parts.push('        <Track>')

  for (const pt of lap.points) {
    parts.push(formatTrackpoint(pt))
  }

  parts.push('        </Track>')
  parts.push('      </Lap>')

  return parts.join('\n')
}

function formatTrackpoint(pt: TrackPoint): string {
  const parts: string[] = []
  parts.push('          <Trackpoint>')
  if (pt.time !== undefined) {
    parts.push(`            <Time>${toIso(pt.time)}</Time>`)
  }
  parts.push('            <Position>')
  parts.push(`              <LatitudeDegrees>${pt.lat.toFixed(7)}</LatitudeDegrees>`)
  parts.push(`              <LongitudeDegrees>${pt.lng.toFixed(7)}</LongitudeDegrees>`)
  parts.push('            </Position>')
  if (pt.ele !== undefined) {
    parts.push(`            <AltitudeMeters>${pt.ele.toFixed(1)}</AltitudeMeters>`)
  }
  if (pt.hr !== undefined) {
    parts.push('            <HeartRateBpm>')
    parts.push(`              <Value>${pt.hr}</Value>`)
    parts.push('            </HeartRateBpm>')
  }
  if (pt.cad !== undefined) {
    parts.push(`            <Cadence>${pt.cad}</Cadence>`)
  }
  // 扩展：速度和功率
  if (pt.speed !== undefined || pt.power !== undefined) {
    parts.push('            <Extensions>')
    parts.push('              <ext:TPX>')
    if (pt.speed !== undefined) {
      parts.push(`                <ext:Speed>${pt.speed.toFixed(2)}</ext:Speed>`)
    }
    if (pt.power !== undefined) {
      parts.push(`                <ext:Watts>${Math.round(pt.power)}</ext:Watts>`)
    }
    parts.push('              </ext:TPX>')
    parts.push('            </Extensions>')
  }
  parts.push('          </Trackpoint>')
  return parts.join('\n')
}

/** 统一 Sport → TCX Sport 属性 */
function mapSport(sport: Sport): string {
  const map: Record<string, string> = {
    running: 'Running',
    cycling: 'Biking',
    swimming: 'Swimming',
    walking: 'Walking',
    hiking: 'Hiking',
    triathlon: 'Other',
    other: 'Other',
  }
  return map[sport] || 'Other'
}

function toIso(ms: number): string {
  return new Date(ms).toISOString()
}
