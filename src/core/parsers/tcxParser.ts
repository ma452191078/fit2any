/**
 * TCX 格式解析器
 * 使用浏览器原生 DOMParser 解析 XML
 *
 * P2 阶段实现完整逻辑
 */

import type { Parser, UnifiedActivity } from '../types'

export const tcxParser: Parser = {
  format: 'TCX',
  parse(_data: ArrayBuffer | string): UnifiedActivity {
    // TODO: P2 实现 — DOMParser 解析 TCX XML
    throw new Error('TCX 解析器待实现（P2）')
  },
}
