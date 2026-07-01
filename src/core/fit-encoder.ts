/**
 * FIT 二进制编码器（自研，基础版）
 *
 * 实现 Garmin FIT 协议的核心编码逻辑：
 * - 文件头（14 字节）
 * - 定义消息 + 数据消息
 * - CRC-16 校验
 *
 * 支持的消息类型：file_id, sport, record, lap, session
 *
 * @see https://developer.garmin.com/fit/protocol/
 */

import type { UnifiedActivity } from './types'

/** FIT 基础数据类型 */
const BaseType = {
  ENUM: 0x00,
  SINT8: 0x01,
  UINT8: 0x02,
  SINT16: 0x83,
  UINT16: 0x84,
  SINT32: 0x85,
  UINT32: 0x86,
  STRING: 0x07,
  FLOAT32: 0x88,
  FLOAT64: 0x89,
  UINT8Z: 0x0a,
  UINT16Z: 0x8b,
  UINT32Z: 0x8c,
  BYTE: 0x0d,
} as const

/** FIT 消息全局编号 */
const MesgNum = {
  FILE_ID: 0,
  SPORT: 12,
  LAP: 19,
  SESSION: 18,
  RECORD: 20,
  ACTIVITY: 34,
} as const

/** FIT epoch: 1989-12-31 00:00:00 UTC（秒） */
const FIT_EPOCH_OFFSET = 631065600

/** 度 → semicircles 转换因子 */
const SEMICIRCLES_FACTOR = (2 ** 31) / 180

/** 运动类型枚举值 */
const SportEnum: Record<string, number> = {
  running: 1,
  cycling: 2,
  transition: 3,
  fitness_equipment: 5,
  swimming: 6,
  walking: 11,
  hiking: 15,
  multisport: 17,
  generic: 0,
}

/**
 * 将 UnifiedActivity 编码为 FIT 二进制文件
 */
export function encodeFit(activity: UnifiedActivity): ArrayBuffer {
  const encoder = new FitEncoder()

  // FileId 消息
  encoder.writeDefinition(MesgNum.FILE_ID, [
    { num: 0, size: 1, baseType: BaseType.ENUM },    // type
    { num: 1, size: 2, baseType: BaseType.UINT16 },   // manufacturer
    { num: 2, size: 2, baseType: BaseType.UINT16 },   // product
    { num: 4, size: 4, baseType: BaseType.UINT32 },   // time_created
    { num: 5, size: 4, baseType: BaseType.UINT32Z },  // serial_number
  ])
  encoder.writeData(MesgNum.FILE_ID, [
    u8(4),            // type = activity
    u16(1),           // manufacturer = garmin
    u16(0),           // product = 0 (generic)
    u32(toFitEpoch(activity.startTime ?? Date.now())),
    u32z(0),          // serial_number
  ])

  // Sport 消息
  encoder.writeDefinition(MesgNum.SPORT, [
    { num: 0, size: 1, baseType: BaseType.ENUM },  // sport
  ])
  encoder.writeData(MesgNum.SPORT, [
    u8(SportEnum[activity.sport] ?? 0),
  ])

  // Record 消息（轨迹点）
  const recordFields = [
    { num: 253, size: 4, baseType: BaseType.UINT32 },  // timestamp
    { num: 0, size: 4, baseType: BaseType.SINT32 },     // position_lat
    { num: 1, size: 4, baseType: BaseType.SINT32 },     // position_long
    { num: 2, size: 2, baseType: BaseType.UINT16 },     // altitude
    { num: 3, size: 1, baseType: BaseType.UINT8 },      // heart_rate
    { num: 4, size: 1, baseType: BaseType.UINT8 },      // cadence
    { num: 5, size: 4, baseType: BaseType.UINT32 },     // distance
    { num: 6, size: 2, baseType: BaseType.UINT16 },     // speed
  ]
  encoder.writeDefinition(MesgNum.RECORD, recordFields)

  for (const pt of activity.points) {
    const values: Uint8Array[] = [
      u32(toFitEpoch(pt.time ?? activity.startTime ?? Date.now())),
      s32(Math.round(pt.lat * SEMICIRCLES_FACTOR)),
      s32(Math.round(pt.lng * SEMICIRCLES_FACTOR)),
      u16(pt.ele !== undefined ? Math.round((pt.ele + 500) * 5) : 0xFFFF),
      u8(pt.hr ?? 0xFF),
      u8(pt.cad ?? 0xFF),
      u32(0),  // distance placeholder (未累积)
      u16(pt.speed !== undefined ? Math.round(pt.speed * 1000) : 0xFFFF),
    ]
    encoder.writeData(MesgNum.RECORD, values)
  }

  return encoder.finish()
}

// ===== 类型定义辅助 =====

interface FieldDef {
  num: number
  size: number
  baseType: number
}

// ===== 二进制编码辅助函数 =====

function u8(v: number): Uint8Array {
  const b = new Uint8Array(1)
  b[0] = v & 0xFF
  return b
}

function u16(v: number): Uint8Array {
  const b = new Uint8Array(2)
  new DataView(b.buffer).setUint16(0, v, true) // little-endian
  return b
}

function u32(v: number): Uint8Array {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setUint32(0, v, true)
  return b
}

function u32z(v: number): Uint8Array {
  return u32(v === 0 ? 0xFFFFFFFF : v)
}

function s32(v: number): Uint8Array {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setInt32(0, v, true)
  return b
}

/** Unix epoch (ms) → FIT epoch (秒) */
function toFitEpoch(unixMs: number): number {
  return Math.floor(unixMs / 1000) - FIT_EPOCH_OFFSET
}

// ===== FIT 编码器核心 =====

class FitEncoder {
  private chunks: Uint8Array[] = []
  private dataSize = 0

  /**
   * 写入定义消息（Definition Message）
   */
  writeDefinition(globalMsgNum: number, fields: FieldDef[]): void {
    const parts: number[] = []
    // 记录头：0b01000000 = 定义消息，本地消息类型 0
    parts.push(0x40)
    parts.push(0x00) // reserved
    parts.push(0x00) // architecture: 0 = little-endian
    // 全局消息编号（little-endian uint16）
    parts.push(globalMsgNum & 0xFF)
    parts.push((globalMsgNum >> 8) & 0xFF)
    // 字段数量
    parts.push(fields.length)
    // 每个字段定义：field_def_num (1B), size (1B), base_type (1B)
    for (const f of fields) {
      parts.push(f.num & 0xFF)
      parts.push(f.size & 0xFF)
      parts.push(f.baseType & 0xFF)
    }
    this.append(new Uint8Array(parts))
  }

  /**
   * 写入数据消息（Data Message）
   * local message type = 0（对应最近一次 writeDefinition）
   */
  writeData(_globalMsgNum: number, values: Uint8Array[]): void {
    const parts: number[] = []
    // 记录头：0b00000000 = 数据消息，本地消息类型 0
    parts.push(0x00)
    this.append(new Uint8Array(parts))
    for (const v of values) {
      this.append(v)
    }
  }

  /**
   * 完成编码，返回完整 FIT 文件
   */
  finish(): ArrayBuffer {
    // 计算数据部分大小
    const dataBytes = this.chunks.reduce((sum, c) => sum + c.length, 0)

    // 构建文件头（14 字节）
    const header = new Uint8Array(14)
    header[0] = 14            // header size
    header[1] = 0x10          // protocol version 1.0
    // profile version (little-endian uint16)
    header[2] = 0xD9 & 0xFF
    header[3] = 0x07 & 0xFF
    // data size (little-endian uint32)
    new DataView(header.buffer).setUint32(4, dataBytes, true)
    // ".FIT" signature
    header[8] = 0x2E  // .
    header[9] = 0x46  // F
    header[10] = 0x49 // I
    header[11] = 0x54 // T
    // header CRC (bytes 12-13) — 先置 0，后面计算
    header[12] = 0x00
    header[13] = 0x00

    // 计算头部 CRC
    const headerCrc = calcCrc(header.slice(0, 12))
    header[12] = headerCrc & 0xFF
    header[13] = (headerCrc >> 8) & 0xFF

    // 组装完整文件
    const full = new Uint8Array(14 + dataBytes + 2)
    full.set(header, 0)
    let offset = 14
    for (const chunk of this.chunks) {
      full.set(chunk, offset)
      offset += chunk.length
    }

    // 计算文件 CRC（从头部到数据末尾）
    const fileCrc = calcCrc(full.slice(0, 14 + dataBytes))
    full[14 + dataBytes] = fileCrc & 0xFF
    full[14 + dataBytes + 1] = (fileCrc >> 8) & 0xFF

    return full.buffer
  }

  private append(arr: Uint8Array): void {
    this.chunks.push(arr)
    this.dataSize += arr.length
  }
}

/**
 * CRC-16 计算（FIT 使用的 CRC 算法）
 * 多项式：0x1021，初始值：0x0000
 */
function calcCrc(data: Uint8Array): number {
  let crc = 0x0000
  const table = getCrcTable()
  for (let i = 0; i < data.length; i++) {
    crc = ((crc << 8) ^ table[((crc >> 8) ^ data[i]) & 0xFF]) & 0xFFFF
  }
  return crc
}

let _crcTable: Uint16Array | null = null

function getCrcTable(): Uint16Array {
  if (_crcTable) return _crcTable
  _crcTable = new Uint16Array(256)
  for (let i = 0; i < 256; i++) {
    let crc = i << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF
      } else {
        crc = (crc << 1) & 0xFFFF
      }
    }
    _crcTable[i] = crc
  }
  return _crcTable
}
