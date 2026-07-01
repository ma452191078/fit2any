/**
 * FIT 格式解析器
 * 使用 fit-file-parser 库解析 Garmin FIT 二进制文件
 *
 * FIT 是 Garmin 专有二进制格式，包含最丰富的运动数据。
 * fit-file-parser 会将坐标从 semicircles 转为度数，时间转为 Date。
 */

import type { Parser, UnifiedActivity, TrackPoint, Lap, Sport } from '../types'

export const fitParser: Parser = {
  format: 'FIT',
  async parse(data: ArrayBuffer | string): Promise<UnifiedActivity> {
    const buf = typeof data === 'string'
      ? new TextEncoder().encode(data).buffer
      : data

    // 动态 import（CJS 模块，Vite 自动处理）
    const FitParserModule = await import('fit-file-parser')
    const FitParser = FitParserModule.default

    const parser = new FitParser({
      force: true,
      mode: 'list',
    })

    const result = await parser.parseAsync(buf as ArrayBuffer)

    return mapFitToActivity(result)
  },
}

/** fit-file-parser 解析结果 → UnifiedActivity */
function mapFitToActivity(data: any): UnifiedActivity {
  const records: any[] = data.records || []
  const laps: any[] = data.laps || []
  const sessions: any[] = data.sessions || []
  const session = sessions[0]

  // 运动类型
  const sport = mapSport(session?.sport || data.sport?.[0]?.sport || 'generic')

  // 轨迹点
  const points: TrackPoint[] = records.map((r: any) => {
    const pt: TrackPoint = {
      lat: r.position_lat,
      lng: r.position_long,
    }
    if (r.altitude !== undefined) pt.ele = r.altitude
    if (r.timestamp !== undefined) pt.time = new Date(r.timestamp).getTime()
    if (r.heart_rate !== undefined) pt.hr = r.heart_rate
    if (r.cadence !== undefined) pt.cad = r.cadence
    if (r.speed !== undefined) pt.speed = r.speed
    if (r.power !== undefined) pt.power = r.power
    return pt
  }).filter(p => !isNaN(p.lat) && !isNaN(p.lng))

  // 圈数据
  const mappedLaps: Lap[] | undefined = laps.length > 0
    ? laps.map((l: any) => ({
      startTime: l.start_time ? new Date(l.start_time).getTime() : undefined,
      totalTime: l.total_elapsed_time,
      distance: l.total_distance,
      avgHr: l.avg_heart_rate,
      maxHr: l.max_heart_rate,
      points: [], // FIT list 模式下 records 不嵌套在 lap 中
    }))
    : undefined

  // 汇总信息
  const startTime = records[0]?.timestamp
    ? new Date(records[0].timestamp).getTime()
    : undefined

  const totalTime = session?.total_elapsed_time || session?.total_timer_time
  const totalDistance = session?.total_distance
  const calories = session?.total_calories
  const avgHr = session?.avg_heart_rate
  const maxHr = session?.max_heart_rate

  // 设备信息
  const fileId = data.file_id?.[0] || data.file_id
  const device = fileId?.product_name || undefined

  return {
    sport,
    startTime,
    totalTime,
    totalDistance,
    calories,
    avgHr,
    maxHr,
    device,
    points,
    laps: mappedLaps,
  }
}

/** FIT sport 字符串 → 统一 Sport */
function mapSport(sport: string): Sport {
  const s = sport.toLowerCase()
  if (s.includes('run')) return 'running' as Sport
  if (s.includes('cycl') || s.includes('bike') || s.includes('e_bik')) return 'cycling' as Sport
  if (s.includes('swim')) return 'swimming' as Sport
  if (s.includes('walk')) return 'walking' as Sport
  if (s.includes('hike')) return 'hiking' as Sport
  if (s.includes('multi') || s.includes('trans')) return 'triathlon' as Sport
  return 'other' as Sport
}
