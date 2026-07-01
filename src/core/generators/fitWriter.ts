/**
 * FIT 格式生成器
 * 将 UnifiedActivity 编码为 FIT 二进制文件
 *
 * 使用自研 fit-encoder 实现 FIT 协议编码。
 * 支持基础消息：file_id, sport, record
 */

import type { Writer, UnifiedActivity } from '../types'
import { encodeFit } from '../fit-encoder'

export const fitWriter: Writer = {
  format: 'FIT',
  write(activity: UnifiedActivity): Blob {
    const buffer = encodeFit(activity)
    return new Blob([buffer], { type: 'application/vnd.ant.fit' })
  },
}
