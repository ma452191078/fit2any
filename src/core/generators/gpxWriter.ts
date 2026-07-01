/**
 * GPX 格式生成器
 * 将 UnifiedActivity 序列化为 GPX 1.1 XML
 *
 * GPX 仅支持轨迹点（lat/lng/ele/time）。
 * 心率等扩展数据写入 gpxtpx 扩展命名空间（Garmin 约定）。
 */

import type { Writer, UnifiedActivity, TrackPoint } from '../types'

export const gpxWriter: Writer = {
  format: 'GPX',
  write(activity: UnifiedActivity): Blob {
    const xml = generateGpx(activity)
    return new Blob([xml], { type: 'application/gpx+xml;charset=utf-8' })
  },
}

const GPX_NS = 'http://www.topografix.com/GPX/1/1'
const GPXTPX_NS = 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1'

function generateGpx(activity: UnifiedActivity): string {
  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push(
    `<gpx version="1.1" creator="Fit2Any" xmlns="${GPX_NS}" ` +
    `xmlns:gpxtpx="${GPXTPX_NS}">`,
  )

  // metadata
  lines.push('  <metadata>')
  if (activity.startTime) {
    lines.push(`    <time>${toIso(activity.startTime)}</time>`)
  }
  lines.push('  </metadata>')

  // track
  const name = activity.sport ? `${activity.sport} activity` : 'Activity'
  lines.push('  <trk>')
  lines.push(`    <name>${escapeXml(name)}</name>`)

  // 如果有圈数据，每圈一个 trkseg；否则一个 trkseg 包含所有点
  // lap.points 为空时回退到 activity.points
  if (activity.laps && activity.laps.length > 0) {
    for (const lap of activity.laps) {
      const pts = lap.points.length > 0 ? lap.points : activity.points
      lines.push('    <trkseg>')
      for (const pt of pts) {
        lines.push(formatTrkpt(pt))
      }
      lines.push('    </trkseg>')
    }
  } else {
    lines.push('    <trkseg>')
    for (const pt of activity.points) {
      lines.push(formatTrkpt(pt))
    }
    lines.push('    </trkseg>')
  }

  lines.push('  </trk>')
  lines.push('</gpx>')

  return lines.join('\n')
}

function formatTrkpt(pt: TrackPoint): string {
  const parts: string[] = []
  parts.push(`    <trkpt lat="${pt.lat.toFixed(7)}" lon="${pt.lng.toFixed(7)}">`)
  if (pt.ele !== undefined) {
    parts.push(`      <ele>${pt.ele.toFixed(1)}</ele>`)
  }
  if (pt.time !== undefined) {
    parts.push(`      <time>${toIso(pt.time)}</time>`)
  }
  // 扩展数据
  if (pt.hr !== undefined || pt.cad !== undefined) {
    parts.push('      <extensions>')
    parts.push('        <gpxtpx:TrackPointExtension>')
    if (pt.hr !== undefined) {
      parts.push(`          <gpxtpx:hr>${pt.hr}</gpxtpx:hr>`)
    }
    if (pt.cad !== undefined) {
      parts.push(`          <gpxtpx:cad>${pt.cad}</gpxtpx:cad>`)
    }
    parts.push('        </gpxtpx:TrackPointExtension>')
    parts.push('      </extensions>')
  }
  parts.push('    </trkpt>')
  return parts.join('\n')
}

/** epoch ms → ISO 8601 字符串 */
function toIso(ms: number): string {
  return new Date(ms).toISOString()
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
