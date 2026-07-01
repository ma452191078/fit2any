/**
 * GPX Parser & Writer 单元测试
 */

import { describe, it, expect } from 'vitest'
import { gpxParser } from '@/core/parsers/gpxParser'
import { gpxWriter } from '@/core/generators/gpxWriter'
import { createSampleGpx, createSampleActivity } from './fixtures'

describe('GPX Parser', () => {
  it('应该正确解析 GPX 文件', async () => {
    const activity = await gpxParser.parse(createSampleGpx())

    expect(activity.points.length).toBe(3)
    expect(activity.points[0].lat).toBeCloseTo(39.9042, 4)
    expect(activity.points[0].lng).toBeCloseTo(116.4074, 4)
    expect(activity.points[0].ele).toBeCloseTo(50.0, 1)
    expect(activity.points[0].time).toBeDefined()
  })

  it('应该推断运动类型为跑步', async () => {
    const activity = await gpxParser.parse(createSampleGpx())
    expect(activity.sport).toBe('running')
  })

  it('应该解析起始时间', async () => {
    const activity = await gpxParser.parse(createSampleGpx())
    expect(activity.startTime).toBeDefined()
    expect(activity.startTime).toBeGreaterThan(0)
  })

  it('应该计算总时长', async () => {
    const activity = await gpxParser.parse(createSampleGpx())
    expect(activity.totalTime).toBe(2) // 2 秒（3 个点，间隔 1 秒）
  })

  it('无效 XML 应该抛出错误', async () => {
    await expect(gpxParser.parse('not xml')).rejects.toThrow()
  })

  it('非 GPX 根元素应该抛出错误', async () => {
    await expect(gpxParser.parse('<?xml version="1.0"?><root></root>')).rejects.toThrow()
  })
})

describe('GPX Writer', () => {
  it('应该生成有效的 GPX XML', () => {
    const activity = createSampleActivity()
    const blob = gpxWriter.write(activity)
    expect(blob.size).toBeGreaterThan(0)
  })

  it('生成的 GPX 包含所有轨迹点', async () => {
    const activity = createSampleActivity()
    const blob = gpxWriter.write(activity)
    const text = await blob.text()
    const trkptCount = (text.match(/<trkpt/g) || []).length
    expect(trkptCount).toBe(activity.points.length)
  })

  it('生成的 GPX 包含正确坐标', async () => {
    const activity = createSampleActivity()
    const text = await gpxWriter.write(activity).text()
    expect(text).toContain('39.9042')
    expect(text).toContain('116.4074')
  })

  it('生成的 GPX 包含心率扩展数据', async () => {
    const activity = createSampleActivity()
    const text = await gpxWriter.write(activity).text()
    expect(text).toContain('gpxtpx:hr')
    expect(text).toContain('120')
  })

  it('往返转换：GPX → Activity → GPX 保持数据一致', async () => {
    const original = createSampleGpx()
    const activity = await gpxParser.parse(original)
    const blob = gpxWriter.write(activity)
    const newText = await blob.text()
    const reparsed = await gpxParser.parse(newText)
    expect(reparsed.points.length).toBe(activity.points.length)
    expect(reparsed.points[0].lat).toBeCloseTo(activity.points[0].lat, 4)
  })
})
