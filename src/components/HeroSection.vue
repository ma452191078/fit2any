<script setup lang="ts">
import ConverterCard from './ConverterCard.vue'
</script>

<template>
  <header class="hero">
    <div class="hero-bg"></div>
    <div class="container hero-grid">
      <div class="hero-text">
        <span class="eyebrow">
          <span class="dot"></span>
          浏览器本地处理 · 数据不上传
        </span>
        <h1>
          运动数据<br />
          <span class="grad">格式自由转换</span>
        </h1>
        <p class="lead">
          上传 FIT、GPX 或 TCX 运动记录文件，一键转换为其他格式。支持三种格式之间任意互转，全程本地处理，安全私密。
        </p>
        <div class="hero-badges">
          <span class="hbadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            数据零上传
          </span>
          <span class="hbadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            永久免费
          </span>
          <span class="hbadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            无需注册
          </span>
        </div>
      </div>

      <ConverterCard />
    </div>
  </header>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 72px 0 64px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.hero-bg::before,
.hero-bg::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}
.hero-bg::before {
  width: 480px;
  height: 480px;
  top: -120px;
  right: -60px;
  background: radial-gradient(circle, #10b981, transparent 70%);
}
.hero-bg::after {
  width: 420px;
  height: 420px;
  bottom: -160px;
  left: -80px;
  background: radial-gradient(circle, #f97316, transparent 70%);
  opacity: 0.25;
}
.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 56px;
  align-items: center;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--r-full);
  background: var(--c-brand-soft);
  border: 1px solid var(--c-brand-border);
  color: var(--c-brand-dd);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-brand);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}
h1 {
  font-size: 52px;
  line-height: 1.08;
  letter-spacing: -0.03em;
  font-weight: 800;
  margin-bottom: 20px;
}
.grad {
  background: linear-gradient(120deg, var(--c-brand-d), var(--c-accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lead {
  font-size: 18px;
  color: var(--c-ink-soft);
  margin-bottom: 32px;
  max-width: 480px;
}
.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.hbadge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--c-ink-soft);
  font-weight: 500;
}
.hbadge svg {
  color: var(--c-brand);
}
@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  h1 {
    font-size: 38px;
  }
}
</style>
