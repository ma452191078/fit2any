<script setup lang="ts">
import { ref } from 'vue'

type Mode = 'single' | 'batch'
const mode = ref<Mode>('single')
</script>

<template>
  <div class="conv-card">
    <div class="conv-inner">
      <div class="conv-head">
        <div class="mode-tabs">
          <button
            class="mtab"
            :class="{ active: mode === 'single' }"
            @click="mode = 'single'"
          >
            单文件转换
          </button>
          <button
            class="mtab"
            :class="{ active: mode === 'batch' }"
            @click="mode = 'batch'"
          >
            批量转换
          </button>
        </div>
        <span class="conv-step">P1 骨架 · 转换器待 P2/P3 接入</span>
      </div>

      <!-- 占位：P3 阶段接入真实转换逻辑 -->
      <div class="placeholder">
        <div class="ph-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="32" height="32">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p class="ph-text">转换器 UI 已就位，解析引擎正在 P2 开发中</p>
        <p class="ph-sub">当前为骨架阶段，单文件 / 批量转换功能将在引擎完成后接入</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.conv-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--r-2xl);
  padding: 8px;
  box-shadow: var(--shadow-lg);
}
.conv-inner {
  background: #fff;
  border-radius: 18px;
  padding: 28px;
  border: 1px solid var(--c-line-soft);
}
.conv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.mode-tabs {
  display: flex;
  gap: 4px;
  background: var(--c-bg-soft);
  padding: 4px;
  border-radius: var(--r-md);
}
.mtab {
  padding: 7px 16px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-mute);
  border-radius: var(--r-sm);
  transition: all 0.15s;
  white-space: nowrap;
}
.mtab:hover {
  color: var(--c-ink-soft);
}
.mtab.active {
  background: #fff;
  color: var(--c-ink);
  box-shadow: var(--shadow-sm);
}
.conv-step {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-ink-mute);
  background: var(--c-bg-soft);
  padding: 4px 10px;
  border-radius: var(--r-full);
}
.placeholder {
  text-align: center;
  padding: 48px 20px;
}
.ph-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: var(--r-lg);
  background: var(--c-bg-soft);
  display: grid;
  place-items: center;
  color: var(--c-ink-mute);
}
.ph-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-ink-soft);
  margin-bottom: 6px;
}
.ph-sub {
  font-size: 13px;
  color: var(--c-ink-mute);
}
</style>
