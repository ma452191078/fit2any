/**
 * FIT 格式解析器
 * 使用 fit-file-parser 库解析 Garmin FIT 二进制文件
 *
 * P2 阶段实现完整逻辑
 */

import type { Parser, UnifiedActivity } from '../types'

export const fitParser: Parser = {
  format: 'FIT',
  parse(_data: ArrayBuffer | string): UnifiedActivity {
    // TODO: P2 实现 — 调用 fit-file-parser 解析
    throw new Error('FIT 解析器待实现（P2）')
  },
}
