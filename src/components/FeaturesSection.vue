<script setup lang="ts">
const features = [
  { icon: 'shield', title: '隐私优先', desc: '所有转换在浏览器本地完成，文件永不上传服务器，数据完全由你掌控', bg: 'var(--c-brand-soft)', color: 'var(--c-brand-d)' },
  { icon: 'bolt', title: '极速转换', desc: '基于 WebAssembly 解析引擎，大文件也能在秒级完成转换，无需等待', bg: 'var(--c-accent-soft)', color: '#ea580c' },
  { icon: 'doc', title: '数据无损', desc: '最大程度保留原始文件中的轨迹、心率、配速等运动数据，转换不丢信息', bg: '#eff6ff', color: '#2563eb' },
  { icon: 'clock', title: '永久免费', desc: '开源项目，无广告无注册，不限制转换次数，任何人都可以自由使用', bg: '#f5f3ff', color: '#7c3aed' },
]
</script>

<template>
  <section class="block" id="features">
    <div class="container">
      <div class="sec-head">
        <div class="sec-eyebrow">产品特性</div>
        <h2>为什么选择 Fit2Any</h2>
        <p>专注做好一件事：安全、快速、无损的运动数据格式转换</p>
      </div>
      <div class="feat-grid">
        <div class="feat" v-for="f in features" :key="f.title">
          <div class="feat-ic" :style="{ background: f.bg, color: f.color }">
            <svg v-if="f.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <svg v-else-if="f.icon === 'bolt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <svg v-else-if="f.icon === 'doc'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
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
.feat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.feat { padding: 28px; border-radius: 18px; border: 1px solid var(--c-line); background: #fff; transition: transform 0.2s, box-shadow 0.2s; }
.feat:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.feat-ic { width: 44px; height: 44px; border-radius: 12px; margin-bottom: 16px; display: grid; place-items: center; }
.feat h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.feat p { font-size: 13px; color: var(--c-ink-soft); line-height: 1.55; }
@media (max-width: 768px) { .feat-grid { grid-template-columns: 1fr; } }
</style>
