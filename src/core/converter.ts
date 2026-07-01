/**
 * 转换调度入口
 *
 * 统一模型架构：source → UnifiedActivity → target
 */

import type { FileFormat, ConvertResult, Parser, Writer } from './types'
import { fitParser } from './parsers/fitParser'
import { gpxParser } from './parsers/gpxParser'
import { tcxParser } from './parsers/tcxParser'
import { fitWriter } from './generators/fitWriter'
import { gpxWriter } from './generators/gpxWriter'
import { tcxWriter } from './generators/tcxWriter'

const parsers: Record<FileFormat, Parser> = {
  FIT: fitParser,
  GPX: gpxParser,
  TCX: tcxParser,
}

const writers: Record<FileFormat, Writer> = {
  FIT: fitWriter,
  GPX: gpxWriter,
  TCX: tcxWriter,
}

/** 从文件扩展名推断格式 */
export function detectFormat(filename: string): FileFormat | null {
  const ext = filename.split('.').pop()?.toUpperCase()
  if (ext === 'FIT' || ext === 'GPX' || ext === 'TCX') return ext
  return null
}

/**
 * 执行单次格式转换
 * @param filename 源文件名
 * @param data 源文件内容
 * @param targetFormat 目标格式
 * @returns 转换结果
 */
export function convert(
  filename: string,
  data: ArrayBuffer | string,
  targetFormat: FileFormat,
): ConvertResult {
  const sourceFormat = detectFormat(filename)
  if (!sourceFormat) {
    throw new Error(`不支持的文件格式：${filename}`)
  }
  if (sourceFormat === targetFormat) {
    throw new Error('源格式与目标格式相同，无需转换')
  }

  const parser = parsers[sourceFormat]
  const writer = writers[targetFormat]

  const activity = parser.parse(data)
  const blob = writer.write(activity)

  const baseName = filename.replace(/\.[^.]+$/, '')
  const outFilename = `${baseName}.${targetFormat.toLowerCase()}`

  return {
    filename: outFilename,
    format: targetFormat,
    blob,
    size: blob.size,
  }
}
