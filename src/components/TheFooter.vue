<script setup lang="ts">
const cols = [
  { title: '产品', links: [{ label: '支持格式', href: '#formats' }, { label: '使用流程', href: '#how' }, { label: '产品特性', href: '#features' }] },
  { title: '资源', links: [{ label: '常见问题', href: '#faq' }, { label: '使用文档', href: '#' }, { label: '格式说明', href: '#' }] },
  { title: '项目', links: [{ label: 'GitHub', href: 'https://github.com/ma452191078/fit2any' }, { label: '问题反馈', href: '#' }, { label: '开源协议', href: '#' }] },
]
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="foot-grid">
        <div class="foot-brand">
          <a href="#" class="logo">
            <span class="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M3 12h4l3-9 4 18 3-9h4" />
              </svg>
            </span>
            Fit2Any
          </a>
          <p>开源的运动数据格式转换工具，专注隐私与效率。让运动数据在不同平台间自由流动。</p>
        </div>
        <div class="foot-col" v-for="col in cols" :key="col.title">
          <h4>{{ col.title }}</h4>
          <a v-for="link in col.links" :key="link.label" :href="link.href">{{ link.label }}</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 Fit2Any · MIT License</span>
        <span>数据本地处理 · 永不上传</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { padding: 56px 0 40px; border-top: 1px solid var(--c-line); margin-top: 80px; }
.foot-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; letter-spacing: -0.02em; }
.logo-mark { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--c-brand), var(--c-brand-dd)); display: grid; place-items: center; color: #fff; }
.foot-brand p { font-size: 14px; color: var(--c-ink-soft); margin-top: 14px; max-width: 280px; }
.foot-col h4 { font-size: 13px; font-weight: 700; margin-bottom: 14px; }
.foot-col a { display: block; font-size: 14px; color: var(--c-ink-soft); margin-bottom: 10px; transition: color 0.15s; }
.foot-col a:hover { color: var(--c-brand-d); }
.foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--c-line-soft); font-size: 13px; color: var(--c-ink-mute); }
@media (max-width: 768px) { .foot-grid { grid-template-columns: 1fr 1fr; } }
</style>
