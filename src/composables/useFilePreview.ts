import type { FileFormat, UnifiedActivity } from '@/core/types'
import { fitParser } from '@/core/parsers/fitParser'
import { gpxParser } from '@/core/parsers/gpxParser'
import { tcxParser } from '@/core/parsers/tcxParser'

/** 运动类型中文映射 */
const sportMap: Record<string, string> = {
  running: '跑步',
  cycling: '骑行',
  swimming: '游泳',
  hiking: '徒步',
  walking: '步行',
  triathlon: '铁三',
  other: '运动',
}

/** 预解析文件，返回简要描述信息 */
export async function previewFile(
  format: FileFormat,
  data: ArrayBuffer,
): Promise<{ activity?: UnifiedActivity; description: string }> {
  try {
    const parsers = { FIT: fitParser, GPX: gpxParser, TCX: tcxParser }
    const activity = await parsers[format].parse(data)
    const parts: string[] = [sportMap[activity.sport] || '运动']
    if (activity.totalDistance) parts.push((activity.totalDistance / 1000).toFixed(2) + ' km')
    if (activity.totalTime) {
      const m = Math.floor(activity.totalTime / 60)
      const s = Math.round(activity.totalTime % 60)
      parts.push(`${m}:${s.toString().padStart(2, '0')}`)
    }
    if (activity.points.length) parts.push(activity.points.length + ' 个轨迹点')
    return { activity, description: parts.join(' · ') }
  } catch {
    return { description: '' }
  }
}

/** 格式化文件大小 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}
