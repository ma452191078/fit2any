/**
 * Fit2Any 统一运动数据模型
 *
 * 所有格式（FIT / GPX / TCX）先解析为 UnifiedActivity，
 * 再由 UnifiedActivity 生成目标格式。
 * 这样只需 3 parser + 3 writer，而非 6 个两两转换器。
 */

/** 运动类型枚举（覆盖主流运动） */
export enum Sport {
  Running = 'running',
  Cycling = 'cycling',
  Swimming = 'swimming',
  Hiking = 'hiking',
  Walking = 'walking',
  Triathlon = 'triathlon',
  Other = 'other',
}

/** 单个轨迹点 */
export interface TrackPoint {
  /** 纬度 WGS84 */
  lat: number
  /** 经度 WGS84 */
  lng: number
  /** 海拔（米） */
  ele?: number
  /** 时间戳（ISO 8601 或 epoch ms） */
  time?: number
  /** 心率（bpm） */
  hr?: number
  /** 步频 / 踏频（spm 或 rpm） */
  cad?: number
  /** 功率（瓦特） */
  power?: number
  /** 速度（m/s） */
  speed?: number
}

/** 圈（Lap）信息 */
export interface Lap {
  /** 圈开始时间 */
  startTime?: number
  /** 圈总时长（秒） */
  totalTime?: number
  /** 圈总距离（米） */
  distance?: number
  /** 平均心率 */
  avgHr?: number
  /** 最大心率 */
  maxHr?: number
  /** 该圈包含的轨迹点 */
  points: TrackPoint[]
}

/** 统一运动数据模型 */
export interface UnifiedActivity {
  /** 运动类型 */
  sport: Sport
  /** 活动开始时间（epoch ms） */
  startTime?: number
  /** 总时长（秒） */
  totalTime?: number
  /** 总距离（米） */
  totalDistance?: number
  /** 平均心率 */
  avgHr?: number
  /** 最大心率 */
  maxHr?: number
  /** 消耗热量（千卡） */
  calories?: number
  /** 设备名称 */
  device?: string
  /** 所有轨迹点（扁平化） */
  points: TrackPoint[]
  /** 分圈数据（FIT/TCX 可能有，GPX 通常无） */
  laps?: Lap[]
  /** 源格式未覆盖的扩展字段，兜底保留 */
  extras?: Record<string, unknown>
}

/** 支持的文件格式 */
export type FileFormat = 'FIT' | 'GPX' | 'TCX'

/** 转换结果 */
export interface ConvertResult {
  /** 输出文件名 */
  filename: string
  /** 输出格式 */
  format: FileFormat
  /** 输出文件内容（Blob 或字符串） */
  blob: Blob
  /** 输出文件大小（字节） */
  size: number
}

/** 解析器接口：原始数据 → UnifiedActivity */
export interface Parser {
  format: FileFormat
  parse(data: ArrayBuffer | string): UnifiedActivity
}

/** 生成器接口：UnifiedActivity → 目标格式 */
export interface Writer {
  format: FileFormat
  write(activity: UnifiedActivity): Blob
}
