/**
 * FIT 格式生成器
 * 将 UnifiedActivity 序列化为 FIT 二进制
 *
 * P2 阶段实现完整逻辑
 */

import type { Writer, UnifiedActivity } from '../types'

export const fitWriter: Writer = {
  format: 'FIT',
  write(_activity: UnifiedActivity): Blob {
    // TODO: P2 实现 — 生成 FIT 二进制
    throw new Error('FIT 生成器待实现（P2）')
  },
}
