/**
 * GPX 格式生成器
 * 将 UnifiedActivity 序列化为 GPX XML 文本
 *
 * P2 阶段实现完整逻辑
 */

import type { Writer, UnifiedActivity } from '../types'

export const gpxWriter: Writer = {
  format: 'GPX',
  write(activity: UnifiedActivity): Blob {
    // TODO: P2 实现 — 生成 GPX XML
    const xml = generateGpx(activity)
    return new Blob([xml], { type: 'application/gpx+xml' })
  },
}

function generateGpx(_activity: UnifiedActivity): string {
  throw new Error('GPX 生成器待实现（P2）')
}
