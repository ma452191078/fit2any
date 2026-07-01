<script setup lang="ts">
import { ref } from 'vue'

const faqs = [
  { q: '我的运动数据会上传到服务器吗？', a: '不会。Fit2Any 的所有文件解析与格式转换完全在你的浏览器本地完成，使用 WebAssembly 技术。你的运动文件永远不会被上传到任何服务器，关闭页面后数据即刻清除，最大程度保护隐私。', open: true },
  { q: '三种格式之间都能互转吗？', a: '是的。FIT、GPX、TCX 三种格式支持任意方向互转，共 6 种转换组合。不过需要注意，GPX 格式本身不包含心率、功率等训练数据，从 GPX 转出时这些字段无法凭空生成，仅保留轨迹与时间信息。', open: false },
  { q: '转换会丢失数据吗？', a: '我们尽可能做到无损转换，但受目标格式本身的字段限制，部分数据可能无法保留。例如 FIT 包含的踏频、功率等高级数据，转换为 GPX 时会丢失（GPX 仅支持轨迹点）。转换为 TCX 则可保留心率、配速、圈数等训练数据。建议根据用途选择合适的目标格式。', open: false },
  { q: '支持哪些类型的运动记录？', a: '支持跑步、骑行、游泳、徒步、铁人三项等所有主流运动类型。只要你的设备能导出 FIT / GPX / TCX 格式，Fit2Any 都能处理。包括 Garmin、佳明、颂拓、Wahoo 等主流运动手表与码表导出的文件。', open: false },
  { q: '有文件大小限制吗？', a: '单文件最大支持 50MB，足以覆盖绝大多数运动记录（一次马拉松的 FIT 文件通常在 1-5MB 之间）。由于处理在本地进行，文件越大转换耗时越长，但一般在数秒内即可完成。', open: false },
]

const openIndex = ref(0)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <section class="block faq-bg" id="faq">
    <div class="container">
      <div class="sec-head">
        <div class="sec-eyebrow">常见问题</div>
        <h2>你可能想知道的</h2>
      </div>
      <div class="faq-list">
        <div class="faq-item" :class="{ open: openIndex === i }" v-for="(item, i) in faqs" :key="i">
          <button class="faq-q" @click="toggle(i)">
            {{ item.q }}
            <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="faq-a" :style="{ maxHeight: openIndex === i ? '300px' : '0' }">
            <div class="faq-a-inner">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block { padding: 88px 0; }
.faq-bg { background: var(--c-bg-soft); }
.sec-head { text-align: center; max-width: 620px; margin: 0 auto 56px; }
.sec-eyebrow { font-size: 13px; font-weight: 700; color: var(--c-brand-d); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.sec-head h2 { font-size: 38px; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 14px; font-weight: 800; }
.faq-list { max-width: 760px; margin: 0 auto; }
.faq-item { background: #fff; border: 1px solid var(--c-line); border-radius: 14px; margin-bottom: 12px; overflow: hidden; transition: box-shadow 0.2s; }
.faq-item.open { box-shadow: var(--shadow-md); }
.faq-q { width: 100%; text-align: left; padding: 20px 24px; border: none; background: none; font-size: 16px; font-weight: 600; color: var(--c-ink); display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.chev { color: var(--c-ink-mute); transition: transform 0.2s; flex-shrink: 0; }
.faq-item.open .chev { transform: rotate(180deg); }
.faq-a { overflow: hidden; transition: max-height 0.3s ease; }
.faq-a-inner { padding: 0 24px 22px; font-size: 14px; color: var(--c-ink-soft); line-height: 1.7; }
</style>
