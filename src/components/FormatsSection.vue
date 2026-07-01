<script setup lang="ts">
const formats = [
  {
    code: 'FIT',
    name: 'Flexible & Interoperable',
    ext: '.fit · 二进制格式',
    desc: 'Garmin 专有的高效二进制格式，记录最为丰富的运动数据：轨迹、心率、步频、功率、踏频等。文件体积小，但需专用工具解析。',
    feats: ['数据维度最全', '文件体积小', 'Garmin 设备原生'],
    ringBg: 'var(--c-fit-bg)',
    ringColor: 'var(--c-fit)',
  },
  {
    code: 'GPX',
    name: 'GPS Exchange Format',
    ext: '.gpx · XML 文本格式',
    desc: '通用的 GPS 轨迹交换格式，基于 XML，可读性强、兼容性最好。记录航点、轨迹与时间戳，几乎所有地图与运动平台都支持导入。',
    feats: ['通用性最强', '纯文本可读', '跨平台兼容'],
    ringBg: 'var(--c-gpx-bg)',
    ringColor: 'var(--c-gpx)',
  },
  {
    code: 'TCX',
    name: 'Training Center XML',
    ext: '.tcx · XML 文本格式',
    desc: 'Garmin Training Center 的 XML 格式，在轨迹基础上增加心率、配速、圈数等训练数据。介于 FIT 与 GPX 之间，适合运动分析。',
    feats: ['含训练数据', 'XML 可读', 'Strava 友好'],
    ringBg: 'var(--c-tcx-bg)',
    ringColor: 'var(--c-tcx)',
  },
]
</script>

<template>
  <section class="block" id="formats">
    <div class="container">
      <div class="sec-head">
        <div class="sec-eyebrow">支持格式</div>
        <h2>三种主流运动数据格式</h2>
        <p>覆盖 Garmin、Strava、佳明等主流运动设备与平台，三种格式之间任意互转</p>
      </div>
      <div class="fmt-grid">
        <div class="fmt-card" v-for="f in formats" :key="f.code">
          <div class="ring" :style="{ background: f.ringBg, color: f.ringColor }">{{ f.code }}</div>
          <h3>{{ f.name }}</h3>
          <div class="ext">{{ f.ext }}</div>
          <p>{{ f.desc }}</p>
          <ul class="fmt-feats">
            <li v-for="feat in f.feats" :key="feat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ feat }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block { padding: 88px 0; }
.sec-head { text-align: center; max-width: 620px; margin: 0 auto 56px; }
.sec-eyebrow { font-size: 13px; font-weight: 700; color: var(--c-brand-d); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.sec-head h2 { font-size: 38px; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 14px; font-weight: 800; }
.sec-head p { font-size: 17px; color: var(--c-ink-soft); }
.fmt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.fmt-card { padding: 32px; border-radius: var(--r-xl); border: 1px solid var(--c-line); background: #fff; transition: transform 0.2s, box-shadow 0.2s; }
.fmt-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.ring { width: 56px; height: 56px; border-radius: var(--r-lg); display: grid; place-items: center; font-weight: 800; font-size: 15px; margin-bottom: 20px; }
.fmt-card h3 { font-size: 22px; margin-bottom: 6px; font-weight: 800; }
.ext { font-size: 13px; color: var(--c-ink-mute); font-weight: 600; margin-bottom: 14px; }
.fmt-card p { font-size: 14px; color: var(--c-ink-soft); margin-bottom: 18px; }
.fmt-feats { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.fmt-feats li { font-size: 13px; color: var(--c-ink-soft); display: flex; align-items: center; gap: 8px; }
.fmt-feats svg { color: var(--c-brand); flex-shrink: 0; }
@media (max-width: 768px) { .fmt-grid { grid-template-columns: 1fr; } }
</style>
