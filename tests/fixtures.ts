/**
 * 测试夹具：构造一个标准的 UnifiedActivity 用于测试
 */

import type { UnifiedActivity } from '@/core/types'

const BASE_TIME = Date.UTC(2026, 5, 1, 8, 0, 0) // 2026-07-01 08:00:00 UTC

export function createSampleActivity(): UnifiedActivity {
  return {
    sport: 'running',
    startTime: BASE_TIME,
    totalTime: 1800,     // 30 分钟
    totalDistance: 5000, // 5km
    avgHr: 150,
    maxHr: 175,
    calories: 320,
    points: [
      { lat: 39.9042, lng: 116.4074, ele: 50.0, time: BASE_TIME, hr: 120, cad: 80, speed: 2.8 },
      { lat: 39.9048, lng: 116.4080, ele: 50.5, time: BASE_TIME + 1000, hr: 135, cad: 82, speed: 3.0 },
      { lat: 39.9054, lng: 116.4086, ele: 51.0, time: BASE_TIME + 2000, hr: 150, cad: 84, speed: 3.2 },
      { lat: 39.9060, lng: 116.4092, ele: 51.5, time: BASE_TIME + 3000, hr: 160, cad: 85, speed: 3.1 },
      { lat: 39.9066, lng: 116.4098, ele: 52.0, time: BASE_TIME + 4000, hr: 165, cad: 83, speed: 2.9 },
    ],
    laps: [
      {
        startTime: BASE_TIME,
        totalTime: 1800,
        distance: 5000,
        avgHr: 150,
        maxHr: 175,
        points: [],
      },
    ],
  }
}

/** 生成一个最小 GPX 字符串 */
export function createSampleGpx(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestFit2Any" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <time>${new Date(BASE_TIME).toISOString()}</time>
  </metadata>
  <trk>
    <name>Morning Run</name>
    <trkseg>
      <trkpt lat="39.9042" lon="116.4074">
        <ele>50.0</ele>
        <time>${new Date(BASE_TIME).toISOString()}</time>
      </trkpt>
      <trkpt lat="39.9048" lon="116.4080">
        <ele>50.5</ele>
        <time>${new Date(BASE_TIME + 1000).toISOString()}</time>
      </trkpt>
      <trkpt lat="39.9054" lon="116.4086">
        <ele>51.0</ele>
        <time>${new Date(BASE_TIME + 2000).toISOString()}</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`
}

/** 生成一个最小 TCX 字符串 */
export function createSampleTcx(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Running">
      <Id>${new Date(BASE_TIME).toISOString()}</Id>
      <Lap StartTime="${new Date(BASE_TIME).toISOString()}">
        <TotalTimeSeconds>1800</TotalTimeSeconds>
        <DistanceMeters>5000</DistanceMeters>
        <AverageHeartRateBpm><Value>150</Value></AverageHeartRateBpm>
        <MaximumHeartRateBpm><Value>175</Value></MaximumHeartRateBpm>
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
          <Trackpoint>
            <Time>${new Date(BASE_TIME).toISOString()}</Time>
            <Position>
              <LatitudeDegrees>39.9042</LatitudeDegrees>
              <LongitudeDegrees>116.4074</LongitudeDegrees>
            </Position>
            <AltitudeMeters>50.0</AltitudeMeters>
            <HeartRateBpm><Value>120</Value></HeartRateBpm>
            <Cadence>80</Cadence>
          </Trackpoint>
          <Trackpoint>
            <Time>${new Date(BASE_TIME + 1000).toISOString()}</Time>
            <Position>
              <LatitudeDegrees>39.9048</LatitudeDegrees>
              <LongitudeDegrees>116.4080</LongitudeDegrees>
            </Position>
            <AltitudeMeters>50.5</AltitudeMeters>
            <HeartRateBpm><Value>135</Value></HeartRateBpm>
            <Cadence>82</Cadence>
          </Trackpoint>
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`
}
