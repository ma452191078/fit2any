<script setup lang="ts">
const navItems = [
  { label: '支持格式', href: '#formats' },
  { label: '使用流程', href: '#how' },
  { label: '产品特性', href: '#features' },
  { label: '常见问题', href: '#faq' },
]
</script>

<template>
  <nav class="nav">
    <div class="container nav-inner">
      <a href="#" class="logo">
        <span class="logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12h4l3-9 4 18 3-9h4" />
          </svg>
        </span>
        Fit2Any
      </a>
      <ul class="nav-links">
        <li v-for="item in navItems" :key="item.href">
          <a :href="item.href">{{ item.label }}</a>
        </li>
      </ul>
      <a href="https://github.com/ma452191078/fit2any" class="nav-cta" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
        </svg>
        GitHub
      </a>
    </div>
  </nav>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: saturate(180%) blur(14px);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--c-line-soft);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-h);
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
}
.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--c-brand), var(--c-brand-dd));
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.5);
}
.logo-mark svg {
  width: 20px;
  height: 20px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}
.nav-links a {
  color: var(--c-ink-soft);
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: var(--c-ink);
}
.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  background: var(--c-ink);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.15s, background 0.2s;
}
.nav-cta:hover {
  background: #1e293b;
  transform: translateY(-1px);
}
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>
