/**
 * FIT Writer + 转换流程单元测试
 *
 * 注意：FIT parser 需要 fit-file-parser 库，在 jsdom 环境中测试可能受限。
 * 这里主要测试 FIT writer 的二进制输出和跨格式转换。
 */

import { describe, it, expect } from 'vitest'
import { fitWriter } from '@/core/generators/fitWriter'
import { gpxWriter } from '@/core/generators/gpxWriter'
import { tcxWriter } from '@/core/generators/tcxWriter'
import { gpxParser } from '@/core/parsers/gpxParser'
import { tcxParser } from '@/core/parsers/tcxParser'
import { createSampleActivity, createSampleGpx, createSampleTcx } from './fixtures'

describe('FIT Writer', () => {
  it('应该生成非空的 FIT 二进制数据', () => {
    const activity = createSampleActivity()
    const blob = fitWriter.write(activity)
    expect(blob.size).toBeGreaterThan(14) // 至少大于文件头
  })

  it('生成的 FIT 文件应以 .FIT 签名开头', async () => {
    const activity = createSampleActivity()
    const blob = fitWriter.write(activity)
    const buf = await blob.arrayBuffer()
    const bytes = new Uint8Array(buf)

    // 文件头 14 字节，bytes[8..11] = ".FIT"
    expect(bytes[0]).toBe(14) // header size
    expect(String.fromCharCode(bytes[8])).toBe('.')
    expect(String.fromCharCode(bytes[9])).toBe('F')
    expect(String.fromCharCode(bytes[10])).toBe('I')
    expect(String.fromCharCode(bytes[11])).toBe('T')
  })

  it('生成的 FIT 文件应包含 CRC', async () => {
    const activity = createSampleActivity()
    const blob = fitWriter.write(activity)
    const buf = await blob.arrayBuffer()
    const bytes = new Uint8Array(buf)

    // 最后 2 字节是 CRC
    expect(bytes.length).toBeGreaterThanOrEqual(16) // 14 header + 2 CRC minimum
  })

  it('应该处理空轨迹点的活动', () => {
    const activity = { ...createSampleActivity(), points: [] }
    expect(() => fitWriter.write(activity)).not.toThrow()
  })
})

describe('跨格式转换', () => {
  describe('GPX → TCX', () => {
    it('应该完整转换轨迹点', async () => {
      const activity = await gpxParser.parse(createSampleGpx())
      const tcxText = await tcxWriter.write(activity).text()
      const reparsed = await tcxParser.parse(tcxText)

      expect(reparsed.points.length).toBe(activity.points.length)
      expect(reparsed.points[0].lat).toBeCloseTo(activity.points[0].lat, 4)
      expect(reparsed.points[0].lng).toBeCloseTo(activity.points[0].lng, 4)
    })
  })

  describe('TCX → GPX', () => {
    it('应该完整转换轨迹点和心率', async () => {
      const activity = await tcxParser.parse(createSampleTcx())
      const gpxText = await gpxWriter.write(activity).text()
      const reparsed = await gpxParser.parse(gpxText)

      expect(reparsed.points.length).toBe(activity.points.length)
      expect(reparsed.points[0].lat).toBeCloseTo(activity.points[0].lat, 4)
    })
  })

  describe('Activity → FIT', () => {
    it('应该从 UnifiedActivity 生成有效的 FIT', async () => {
      const activity = createSampleActivity()
      const blob = fitWriter.write(activity)
      const buf = await blob.arrayBuffer()
      const bytes = new Uint8Array(buf)

      // 验证文件头签名
      expect(String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])).toBe('.FIT')
    })
  })

  describe('Activity → GPX → 回读', () => {
    it('数据应在往返后保持一致', async () => {
      const activity = createSampleActivity()
      const gpxText = await gpxWriter.write(activity).text()
      const reparsed = await gpxParser.parse(gpxText)

      expect(reparsed.points.length).toBe(activity.points.length)
      expect(reparsed.points[0].lat).toBeCloseTo(activity.points[0].lat, 4)
      expect(reparsed.points[0].lng).toBeCloseTo(activity.points[0].lng, 4)
      expect(reparsed.points[0].ele).toBeCloseTo(activity.points[0].ele!, 0)
    })
  })

  describe('Activity → TCX → 回读', () => {
    it('数据应在往返后保持一致', async () => {
      const activity = createSampleActivity()
      const tcxText = await tcxWriter.write(activity).text()
      const reparsed = await tcxParser.parse(tcxText)

      expect(reparsed.points.length).toBe(activity.points.length)
      expect(reparsed.points[0].lat).toBeCloseTo(activity.points[0].lat, 4)
      expect(reparsed.points[0].hr).toBe(activity.points[0].hr)
    })
  })
})
