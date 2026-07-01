<script setup lang="ts">
const steps = [
  { num: 1, title: '上传运动文件', desc: '拖拽或点击上传你的 FIT / GPX / TCX 运动记录文件，系统自动识别源格式' },
  { num: 2, title: '选择目标格式', desc: '从剩余两种格式中选择你需要的输出格式，点击开始转换' },
  { num: 3, title: '下载转换结果', desc: '转换在本地瞬间完成，直接下载转换后的文件，数据全程不离开你的设备' },
]
</script>

<template>
  <section class="block steps-bg" id="how">
    <div class="container">
      <div class="sec-head">
        <div class="sec-eyebrow">使用流程</div>
        <h2>三步完成转换</h2>
        <p>无需安装、无需注册，打开即用</p>
      </div>
      <div class="steps-grid">
        <div class="step" v-for="s in steps" :key="s.num">
          <div class="step-ic">
            <span class="step-num">{{ s.num }}</span>
            <svg v-if="s.num === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <svg v-else-if="s.num === 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
              <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block { padding: 88px 0; }
.steps-bg { background: var(--c-bg-soft); }
.sec-head { text-align: center; max-width: 620px; margin: 0 auto 56px; }
.sec-eyebrow { font-size: 13px; font-weight: 700; color: var(--c-brand-d); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.sec-head h2 { font-size: 38px; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 14px; font-weight: 800; }
.sec-head p { font-size: 17px; color: var(--c-ink-soft); }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; position: relative; }
.step { text-align: center; position: relative; z-index: 1; }
.step-ic { width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 20px; background: #fff; border: 2px solid var(--c-line); display: grid; place-items: center; color: var(--c-brand-d); box-shadow: var(--shadow-sm); position: relative; }
.step-num { position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; border-radius: 50%; background: var(--c-ink); color: #fff; font-size: 12px; font-weight: 700; display: grid; place-items: center; }
.step h3 { font-size: 19px; font-weight: 700; margin-bottom: 8px; }
.step p { font-size: 14px; color: var(--c-ink-soft); max-width: 280px; margin: 0 auto; }
@media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr; } }
</style>
