/**
 * TCX Parser & Writer 单元测试
 */

import { describe, it, expect } from 'vitest'
import { tcxParser } from '@/core/parsers/tcxParser'
import { tcxWriter } from '@/core/generators/tcxWriter'
import { createSampleTcx, createSampleActivity } from './fixtures'

describe('TCX Parser', () => {
  it('应该正确解析 TCX 文件', async () => {
    const activity = await tcxParser.parse(createSampleTcx())

    expect(activity.sport).toBe('running')
    expect(activity.points.length).toBe(2)
    expect(activity.points[0].lat).toBeCloseTo(39.9042, 4)
    expect(activity.points[0].lng).toBeCloseTo(116.4074, 4)
    expect(activity.points[0].hr).toBe(120)
    expect(activity.points[0].cad).toBe(80)
  })

  it('应该解析圈数据', async () => {
    const activity = await tcxParser.parse(createSampleTcx())

    expect(activity.laps).toBeDefined()
    expect(activity.laps!.length).toBe(1)
    expect(activity.laps![0].totalTime).toBe(1800)
    expect(activity.laps![0].distance).toBe(5000)
    expect(activity.laps![0].avgHr).toBe(150)
    expect(activity.laps![0].maxHr).toBe(175)
  })

  it('应该解析起始时间', async () => {
    const activity = await tcxParser.parse(createSampleTcx())
    expect(activity.startTime).toBeDefined()
    expect(activity.startTime).toBeGreaterThan(0)
  })

  it('应该解析海拔', async () => {
    const activity = await tcxParser.parse(createSampleTcx())
    expect(activity.points[0].ele).toBeCloseTo(50.0, 1)
  })

  it('无效 XML 应该抛出错误', async () => {
    await expect(tcxParser.parse('invalid')).rejects.toThrow()
  })

  it('非 TCX 根元素应该抛出错误', async () => {
    await expect(tcxParser.parse('<?xml version="1.0"?><root></root>')).rejects.toThrow()
  })
})

describe('TCX Writer', () => {
  it('应该生成有效的 TCX XML', () => {
    const activity = createSampleActivity()
    const blob = tcxWriter.write(activity)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('生成的 TCX 包含正确运动类型', async () => {
    const activity = createSampleActivity()
    const text = await tcxWriter.write(activity).text()
    expect(text).toContain('Sport="Running"')
  })

  it('生成的 TCX 包含所有轨迹点', async () => {
    const activity = createSampleActivity()
    const text = await tcxWriter.write(activity).text()
    const tpCount = (text.match(/<Trackpoint>/g) || []).length
    expect(tpCount).toBe(activity.points.length)
  })

  it('生成的 TCX 包含心率数据', async () => {
    const activity = createSampleActivity()
    const text = await tcxWriter.write(activity).text()
    expect(text).toContain('HeartRateBpm')
    expect(text).toContain('<Value>120</Value>')
  })

  it('生成的 TCX 包含圈数据', async () => {
    const activity = createSampleActivity()
    const text = await tcxWriter.write(activity).text()
    expect(text).toContain('<Lap')
    expect(text).toContain('TotalTimeSeconds')
    expect(text).toContain('DistanceMeters')
  })

  it('往返转换：TCX → Activity → TCX 保持数据一致', async () => {
    const original = createSampleTcx()
    const activity = await tcxParser.parse(original)
    const blob = tcxWriter.write(activity)
    const newText = await blob.text()
    const reparsed = await tcxParser.parse(newText)

    expect(reparsed.points.length).toBe(activity.points.length)
    expect(reparsed.points[0].lat).toBeCloseTo(activity.points[0].lat, 4)
    expect(reparsed.points[0].hr).toBe(activity.points[0].hr)
  })
})
