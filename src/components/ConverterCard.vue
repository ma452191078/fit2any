<script setup lang="ts">
import { ref, computed } from 'vue'
import { convert, detectFormat } from '@/core/converter'
import type { FileFormat, UnifiedActivity } from '@/core/types'
import { fitParser } from '@/core/parsers/fitParser'
import { gpxParser } from '@/core/parsers/gpxParser'
import { tcxParser } from '@/core/parsers/tcxParser'
import { saveAs } from 'file-saver'
import BatchMode from './BatchMode.vue'

type Mode = 'single' | 'batch'
const mode = ref<Mode>('single')

const allFormats: FileFormat[] = ['FIT', 'GPX', 'TCX']

const fmtMeta: Record<FileFormat, { bg: string; color: string }> = {
  FIT: { bg: 'var(--c-fit-bg)', color: 'var(--c-fit)' },
  GPX: { bg: 'var(--c-gpx-bg)', color: 'var(--c-gpx)' },
  TCX: { bg: 'var(--c-tcx-bg)', color: 'var(--c-tcx)' },
}

// ===== 单文件模式 =====
interface LoadedFile {
  name: string
  format: FileFormat
  size: number
  data: ArrayBuffer
  activity?: UnifiedActivity
}

const loadedFile = ref<LoadedFile | null>(null)
const targetFormat = ref<FileFormat | null>(null)
const isConverting = ref(false)
const convertProgress = ref(0)
const convertStage = ref('')
const errorMsg = ref('')
const resultUrl = ref<string | null>(null)
const resultName = ref('')
const resultSize = ref(0)
const isDragging = ref(false)
const batchStepLabel = ref('批量模式 · 添加文件')

const stepLabel = computed(() => {
  if (resultUrl.value) return '完成 · 可下载'
  if (isConverting.value) return '转换中…'
  if (!loadedFile.value) return '第 1 步 · 上传文件'
  if (!targetFormat.value) return '第 2 步 · 选择目标格式'
  return '第 3 步 · 开始转换'
})

const canConvert = computed(() => loadedFile.value && targetFormat.value && !isConverting.value)

const targetOptions = computed(() => {
  return allFormats.filter(f => f !== loadedFile.value?.format)
})

async function handleFile(file: File) {
  errorMsg.value = ''
  resultUrl.value = null
  const fmt = detectFormat(file.name)
  if (!fmt) {
    errorMsg.value = `不支持的文件格式：${file.name}（仅支持 .fit / .gpx / .tcx）`
    return
  }
  const data = await file.arrayBuffer()
  loadedFile.value = { name: file.name, format: fmt, size: data.byteLength, data }
  targetFormat.value = null
  // 预解析以展示文件信息
  try {
    const parsers = { FIT: fitParser, GPX: gpxParser, TCX: tcxParser }
    const activity = await parsers[fmt].parse(data)
    loadedFile.value.activity = activity
  } catch (e) {
    console.warn('预解析失败:', e)
  }
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) handleFile(input.files[0])
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onDragOver() { isDragging.value = true }
function onDragLeave() { isDragging.value = false }

function selectTarget(fmt: FileFormat) {
  targetFormat.value = fmt
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function describeActivity(act?: UnifiedActivity): string {
  if (!act) return ''
  const parts: string[] = []
  const sportMap: Record<string, string> = {
    running: '跑步', cycling: '骑行', swimming: '游泳',
    hiking: '徒步', walking: '步行', triathlon: '铁三', other: '运动',
  }
  parts.push(sportMap[act.sport] || '运动')
  if (act.totalDistance) parts.push((act.totalDistance / 1000).toFixed(2) + ' km')
  if (act.totalTime) {
    const m = Math.floor(act.totalTime / 60)
    const s = Math.round(act.totalTime % 60)
    parts.push(`${m}:${s.toString().padStart(2, '0')}`)
  }
  if (act.points.length) parts.push(act.points.length + ' 个轨迹点')
  return parts.join(' · ')
}

function clearFile() {
  loadedFile.value = null
  targetFormat.value = null
  errorMsg.value = ''
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = null
  }
}

async function doConvert() {
  if (!loadedFile.value || !targetFormat.value || isConverting.value) return
  isConverting.value = true
  convertProgress.value = 10
  convertStage.value = '正在解析文件…'
  errorMsg.value = ''

  try {
    convertProgress.value = 30
    convertStage.value = `正在转换为 ${targetFormat.value}…`
    const result = await convert(loadedFile.value.name, loadedFile.value.data, targetFormat.value)
    convertProgress.value = 90
    convertStage.value = '正在生成文件…'

    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(result.blob)
    resultName.value = result.filename
    resultSize.value = result.size
    convertProgress.value = 100
    convertStage.value = '完成'
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '转换失败'
  } finally {
    isConverting.value = false
  }
}

function downloadResult() {
  if (resultUrl.value) {
    saveAs(resultUrl.value, resultName.value)
  }
}

function triggerFileInput(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const input = target.querySelector('input[type="file"]') as HTMLInputElement
  input?.click()
}

function onBatchStepUpdate(s: string) {
  batchStepLabel.value = s
}
</script>

<template>
  <div class="conv-card">
    <div class="conv-inner">
      <div class="conv-head">
        <div class="mode-tabs">
          <button class="mtab" :class="{ active: mode === 'single' }" @click="mode = 'single'">单文件转换</button>
          <button class="mtab" :class="{ active: mode === 'batch' }" @click="mode = 'batch'">批量转换</button>
        </div>
        <span class="conv-step">{{ mode === 'single' ? stepLabel : batchStepLabel }}</span>
      </div>

      <!-- ===== 单文件模式 ===== -->
      <div v-show="mode === 'single'">
        <div v-if="errorMsg" class="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMsg }}
        </div>

        <div
          v-if="!loadedFile"
          class="dropzone"
          :class="{ drag: isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
        >
          <div class="dz-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="26" height="26"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="dz-main">拖拽文件到此处，或 <span class="link">点击选择</span></div>
          <div class="dz-sub">支持单个文件，最大 50MB</div>
          <div class="dz-formats">
            <span class="dz-tag" v-for="f in allFormats" :key="f" :style="{ background: fmtMeta[f].bg, color: fmtMeta[f].color }">{{ f }}</span>
          </div>
          <input type="file" accept=".fit,.gpx,.tcx" hidden @change="onFileInput" />
        </div>

        <div v-if="loadedFile" class="file-row">
          <div class="file-ic" :style="{ background: fmtMeta[loadedFile.format].bg, color: fmtMeta[loadedFile.format].color }">{{ loadedFile.format }}</div>
          <div class="file-meta">
            <div class="file-name">{{ loadedFile.name }}</div>
            <div class="file-spec">{{ loadedFile.format }} · {{ formatSize(loadedFile.size) }}<template v-if="loadedFile.activity"> · {{ describeActivity(loadedFile.activity) }}</template></div>
          </div>
          <button class="file-x" @click="clearFile" title="移除">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div v-if="loadedFile" class="flow">
          <div class="flow-label">选择目标格式</div>
          <div class="flow-row">
            <div class="flow-side">
              <div class="flow-cap">源格式</div>
              <div class="fmt-options">
                <div class="fmt-opt sel">{{ loadedFile.format }}</div>
              </div>
            </div>
            <div class="flow-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
            <div class="flow-side">
              <div class="flow-cap">目标格式</div>
              <div class="fmt-options">
                <div
                  v-for="f in targetOptions"
                  :key="f"
                  class="fmt-opt"
                  :class="{ sel: targetFormat === f }"
                  @click="selectTarget(f)"
                >{{ f }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loadedFile" class="conv-action">
          <button class="btn-convert" :disabled="!canConvert" @click="doConvert">
            <svg v-if="!isConverting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            <span v-if="isConverting">{{ convertStage }}</span>
            <span v-else>开始转换</span>
          </button>
        </div>

        <div v-if="isConverting" class="progress-wrap">
          <div class="prog-bar"><div class="prog-fill" :style="{ width: convertProgress + '%' }"></div></div>
          <div class="prog-text">{{ convertStage }}</div>
        </div>

        <div v-if="resultUrl" class="result-box">
          <div class="result-card">
            <div class="result-top">
              <div class="result-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="result-tx">转换完成<small>{{ resultName }} · {{ formatSize(resultSize) }}</small></div>
            </div>
            <button class="btn-download" @click="downloadResult">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              下载文件
            </button>
          </div>
        </div>
      </div>

      <!-- ===== 批量模式 ===== -->
      <BatchMode v-show="mode === 'batch'" @step-update="onBatchStepUpdate" />
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
.mode-tabs { display: flex; gap: 4px; background: var(--c-bg-soft); padding: 4px; border-radius: var(--r-md); }
.mtab { padding: 7px 16px; border: none; background: none; font-size: 13px; font-weight: 600; color: var(--c-ink-mute); border-radius: var(--r-sm); transition: all 0.15s; white-space: nowrap; }
.mtab:hover { color: var(--c-ink-soft); }
.mtab.active { background: #fff; color: var(--c-ink); box-shadow: var(--shadow-sm); }
.conv-step { font-size: 12px; font-weight: 600; color: var(--c-ink-mute); background: var(--c-bg-soft); padding: 4px 10px; border-radius: var(--r-full); }

.alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: var(--r-md); background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; margin-bottom: 16px; }

.dropzone { border: 2px dashed #cbd5e1; border-radius: var(--r-lg); padding: 34px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--c-bg-soft); }
.dropzone:hover, .dropzone.drag { border-color: var(--c-brand); background: var(--c-brand-soft); }
.dz-icon { width: 52px; height: 52px; margin: 0 auto 14px; border-radius: var(--r-lg); background: linear-gradient(135deg, var(--c-brand-soft), #d1fae5); display: grid; place-items: center; color: var(--c-brand-d); }
.dz-main { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.dz-main .link { color: var(--c-brand-d); text-decoration: underline; text-underline-offset: 2px; }
.dz-sub { font-size: 13px; color: var(--c-ink-mute); }
.dz-formats { display: flex; justify-content: center; gap: 8px; margin-top: 14px; }
.dz-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.04em; }

.file-row { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: var(--r-lg); background: var(--c-bg-soft); border: 1px solid var(--c-line); }
.file-ic { width: 44px; height: 44px; border-radius: 11px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; font-size: 13px; }
.file-meta { flex: 1; min-width: 0; }
.file-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-spec { font-size: 12px; color: var(--c-ink-mute); margin-top: 2px; }
.file-x { width: 30px; height: 30px; border-radius: 8px; border: none; background: transparent; color: var(--c-ink-mute); display: grid; place-items: center; transition: all 0.15s; }
.file-x:hover { background: #fee2e2; color: #dc2626; }

.flow { margin-top: 20px; }
.flow-label { font-size: 12px; font-weight: 600; color: var(--c-ink-mute); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
.flow-row { display: flex; align-items: center; gap: 14px; }
.flow-side { flex: 1; }
.flow-cap { font-size: 11px; font-weight: 600; color: var(--c-ink-mute); margin-bottom: 6px; }
.fmt-options { display: flex; gap: 8px; }
.fmt-opt { flex: 1; padding: 11px 8px; border-radius: 11px; border: 2px solid var(--c-line); background: #fff; cursor: pointer; text-align: center; transition: all 0.15s; font-size: 13px; font-weight: 700; }
.fmt-opt:hover { border-color: #94a3b8; }
.fmt-opt.sel { border-color: var(--c-brand); background: var(--c-brand-soft); color: var(--c-brand-dd); }
.flow-arrow { width: 40px; flex-shrink: 0; display: grid; place-items: center; color: var(--c-ink-mute); }

.conv-action { margin-top: 22px; }
.btn-convert { width: 100%; padding: 15px; border-radius: 13px; border: none; background: linear-gradient(135deg, var(--c-brand), var(--c-brand-d)); color: #fff; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.5); transition: transform 0.15s, box-shadow 0.2s; }
.btn-convert:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 26px -6px rgba(16, 185, 129, 0.6); }
.btn-convert:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.progress-wrap { margin-top: 16px; }
.prog-bar { height: 6px; border-radius: 999px; background: var(--c-line); overflow: hidden; }
.prog-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--c-brand), var(--c-accent)); transition: width 0.3s; }
.prog-text { font-size: 12px; color: var(--c-ink-mute); margin-top: 8px; text-align: center; }

.result-box { margin-top: 16px; }
.result-card { padding: 18px; border-radius: 14px; background: linear-gradient(135deg, var(--c-brand-soft), #f0fdf4); border: 1px solid var(--c-brand-border); }
.result-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.result-check { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: var(--c-brand); color: #fff; display: grid; place-items: center; }
.result-tx { font-size: 14px; font-weight: 700; }
.result-tx small { display: block; font-weight: 500; color: var(--c-ink-soft); font-size: 12px; margin-top: 1px; }
.btn-download { width: 100%; padding: 12px; border-radius: 11px; border: none; background: var(--c-ink); color: #fff; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; }
.btn-download:hover { background: #1e293b; }

@media (max-width: 768px) {
  .flow-row { flex-direction: column; }
  .flow-arrow { transform: rotate(90deg); margin: 4px 0; }
}
</style>
