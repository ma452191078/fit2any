/**
 * TCX 格式生成器
 * 将 UnifiedActivity 序列化为 TCX XML 文本
 *
 * P2 阶段实现完整逻辑
 */

import type { Writer, UnifiedActivity } from '../types'

export const tcxWriter: Writer = {
  format: 'TCX',
  write(activity: UnifiedActivity): Blob {
    // TODO: P2 实现 — 生成 TCX XML
    const xml = generateTcx(activity)
    return new Blob([xml], { type: 'application/vnd.garmin.tcx+xml' })
  },
}

function generateTcx(_activity: UnifiedActivity): string {
  throw new Error('TCX 生成器待实现（P2）')
}
