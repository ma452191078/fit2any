<script setup lang="ts">
import { ref, computed } from 'vue'
import { convert, detectFormat } from '@/core/converter'
import type { FileFormat, ConvertResult } from '@/core/types'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

const emit = defineEmits<{ 'step-update': [s: string] }>()

const allFormats: FileFormat[] = ['FIT', 'GPX', 'TCX']
const fmtMeta: Record<FileFormat, { bg: string; color: string }> = {
  FIT: { bg: 'var(--c-fit-bg)', color: 'var(--c-fit)' },
  GPX: { bg: 'var(--c-gpx-bg)', color: 'var(--c-gpx)' },
  TCX: { bg: 'var(--c-tcx-bg)', color: 'var(--c-tcx)' },
}

interface BatchFile {
  id: number
  file: File
  name: string
  format: FileFormat
  size: number
  status: 'pending' | 'converting' | 'done' | 'error'
  result?: ConvertResult
  error?: string
}

const batchFiles = ref<BatchFile[]>([])
const batchTarget = ref<FileFormat | null>(null)
const isConverting = ref(false)
const batchProgress = ref(0)
const batchStage = ref('')
let idSeq = 0
const isDragging = ref(false)

const batchStepLabel = computed(() => {
  if (isConverting.value) return batchStage.value
  if (batchFiles.value.length === 0) return '批量模式 · 添加文件'
  if (!batchTarget.value) return '批量模式 · 选择目标格式'
  const doneCount = batchFiles.value.filter(f => f.status === 'done').length
  if (doneCount === batchFiles.value.length && doneCount > 0) return '批量完成 · 可下载'
  return `批量模式 · ${batchFiles.value.length} 个文件`
})

emit('step-update', batchStepLabel.value)

const targetOptions = computed(() => allFormats)

const canConvert = computed(() => batchFiles.value.length > 0 && batchTarget.value && !isConverting.value)

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

async function addFiles(files: FileList | File[]) {
  const arr = Array.from(files)
  for (const file of arr) {
    const fmt = detectFormat(file.name)
    if (!fmt) continue
    batchFiles.value.push({
      id: ++idSeq,
      file,
      name: file.name,
      format: fmt,
      size: file.size,
      status: 'pending',
    })
  }
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(input.files)
  input.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

function onDragOver() { isDragging.value = true }
function onDragLeave() { isDragging.value = false }

function removeFile(id: number) {
  batchFiles.value = batchFiles.value.filter(f => f.id !== id)
}

function selectTarget(fmt: FileFormat) {
  batchTarget.value = fmt
}

function clearAll() {
  batchFiles.value = []
  batchTarget.value = null
  batchProgress.value = 0
}

async function doBatchConvert() {
  if (!batchTarget.value || isConverting.value) return
  isConverting.value = true
  const target = batchTarget.value
  const total = batchFiles.value.length
  let done = 0

  for (const item of batchFiles.value) {
    item.status = 'converting'
    batchStage.value = `正在转换 ${done + 1}/${total}…`
    try {
      const data = await item.file.arrayBuffer()
      const result = await convert(item.name, data, target)
      item.result = result
      item.status = 'done'
    } catch (e) {
      item.error = e instanceof Error ? e.message : '转换失败'
      item.status = 'error'
    }
    done++
    batchProgress.value = Math.round((done / total) * 100)
  }

  batchStage.value = '转换完成'
  isConverting.value = false
}

function triggerFileInput(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const input = target.querySelector('input[type="file"]') as HTMLInputElement
  input?.click()
}

async function downloadAll() {
  const doneFiles = batchFiles.value.filter(f => f.status === 'done' && f.result)
  if (doneFiles.length === 0) return

  if (doneFiles.length === 1) {
    const r = doneFiles[0].result!
    saveAs(r.blob, r.filename)
    return
  }

  // 多文件打包 ZIP
  const zip = new JSZip()
  const usedNames = new Set<string>()
  for (const f of doneFiles) {
    let name = f.result!.filename
    // 避免重名
    if (usedNames.has(name)) {
      const ext = name.split('.').pop()
      const base = name.replace(/\.[^.]+$/, '')
      let i = 1
      while (usedNames.has(`${base}_${i}.${ext}`)) i++
      name = `${base}_${i}.${ext}`
    }
    usedNames.add(name)
    zip.file(name, f.result!.blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `fit2any_batch_${Date.now()}.zip`)
}

function downloadOne(item: BatchFile) {
  if (item.result) saveAs(item.result.blob, item.result.filename)
}
</script>

<template>
  <div>
    <!-- 上传区 -->
    <div
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
      <div class="dz-main">拖拽多个文件到此处，或 <span class="link">点击添加</span></div>
      <div class="dz-sub">支持 FIT / GPX / TCX，可同时添加多个</div>
      <div class="dz-formats">
        <span class="dz-tag" v-for="f in allFormats" :key="f" :style="{ background: fmtMeta[f].bg, color: fmtMeta[f].color }">{{ f }}</span>
      </div>
      <input type="file" accept=".fit,.gpx,.tcx" multiple hidden @change="onFileInput" />
    </div>

    <!-- 文件列表 -->
    <div v-if="batchFiles.length > 0" class="batch-list">
      <div v-for="item in batchFiles" :key="item.id" class="bfile" :class="{ done: item.status === 'done', error: item.status === 'error' }">
        <div class="file-ic" :style="{ background: fmtMeta[item.format].bg, color: fmtMeta[item.format].color }">{{ item.format }}</div>
        <div class="file-meta">
          <div class="file-name">{{ item.name }}</div>
          <div class="file-spec">{{ item.format }} · {{ formatSize(item.size) }}<template v-if="item.status === 'done' && item.result"> → {{ item.result.format }} · {{ formatSize(item.result.size) }}</template></div>
        </div>
        <span v-if="item.status === 'pending'" class="bstatus">待转换</span>
        <span v-else-if="item.status === 'converting'" class="bstatus converting">转换中…</span>
        <span v-else-if="item.status === 'done'" class="bstatus done" @click="downloadOne(item)">✓ 下载</span>
        <span v-else-if="item.status === 'error'" class="bstatus error" :title="item.error">失败</span>
        <button v-if="!isConverting" class="bx" @click="removeFile(item.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div v-if="batchFiles.length > 0" class="batch-count">
      共 {{ batchFiles.length }} 个文件 ·
      <span v-if="batchFiles.filter(f=>f.status==='done').length">已完成 {{ batchFiles.filter(f=>f.status==='done').length }}</span>
      <a v-if="!isConverting" href="#" @click.prevent="clearAll" style="color:var(--c-ink-mute);margin-left:8px">清空</a>
    </div>

    <!-- 目标格式 -->
    <div v-if="batchFiles.length > 0" class="flow">
      <div class="flow-label">统一目标格式</div>
      <div class="fmt-options">
        <div
          v-for="f in targetOptions"
          :key="f"
          class="fmt-opt"
          :class="{ sel: batchTarget === f }"
          @click="selectTarget(f)"
        >{{ f }}</div>
      </div>
      <div class="flow-hint">所有文件将统一转换为此格式。如需不同格式，请使用单文件模式。</div>
    </div>

    <!-- 转换按钮 -->
    <div v-if="batchFiles.length > 0" class="conv-action">
      <button class="btn-convert" :disabled="!canConvert" @click="doBatchConvert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
        <span v-if="isConverting">{{ batchStage }}</span>
        <span v-else>批量转换 ({{ batchFiles.length }})</span>
      </button>
    </div>

    <!-- 进度条 -->
    <div v-if="isConverting" class="progress-wrap">
      <div class="prog-bar"><div class="prog-fill" :style="{ width: batchProgress + '%' }"></div></div>
      <div class="prog-text">{{ batchStage }}</div>
    </div>

    <!-- 批量下载 -->
    <div v-if="!isConverting && batchFiles.filter(f=>f.status==='done').length > 0" class="result-box">
      <div class="result-card">
        <div class="result-top">
          <div class="result-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="result-tx">批量转换完成<small>{{ batchFiles.filter(f=>f.status==='done').length }}/{{ batchFiles.length }} 个文件已转换{{ batchTarget ? '为 ' + batchTarget : '' }}</small></div>
        </div>
        <button class="btn-download" @click="downloadAll">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {{ batchFiles.filter(f=>f.status==='done').length > 1 ? '打包下载全部 (ZIP)' : '下载文件' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropzone {
  border: 2px dashed #cbd5e1; border-radius: var(--r-lg);
  padding: 34px 20px; text-align: center; cursor: pointer;
  transition: all 0.2s; background: var(--c-bg-soft);
}
.dropzone:hover, .dropzone.drag { border-color: var(--c-brand); background: var(--c-brand-soft); }
.dz-icon { width: 52px; height: 52px; margin: 0 auto 14px; border-radius: var(--r-lg); background: linear-gradient(135deg, var(--c-brand-soft), #d1fae5); display: grid; place-items: center; color: var(--c-brand-d); }
.dz-main { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.dz-main .link { color: var(--c-brand-d); text-decoration: underline; text-underline-offset: 2px; }
.dz-sub { font-size: 13px; color: var(--c-ink-mute); }
.dz-formats { display: flex; justify-content: center; gap: 8px; margin-top: 14px; }
.dz-tag { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.04em; }

.batch-list { margin-top: 18px; display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
.bfile { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 11px; background: #fff; border: 1px solid var(--c-line); transition: border-color 0.15s; }
.bfile:hover { border-color: #cbd5e1; }
.bfile.done { border-color: var(--c-brand-border); background: var(--c-brand-soft); }
.bfile.error { border-color: #fecaca; background: #fef2f2; }
.file-ic { width: 34px; height: 34px; border-radius: 9px; font-size: 11px; flex-shrink: 0; display: grid; place-items: center; font-weight: 800; }
.file-meta { flex: 1; min-width: 0; }
.file-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-spec { font-size: 11px; color: var(--c-ink-mute); margin-top: 1px; }
.bstatus { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: var(--c-bg-soft); color: var(--c-ink-mute); white-space: nowrap; }
.bstatus.converting { background: #fef3c7; color: #b45309; }
.bstatus.done { background: var(--c-brand); color: #fff; cursor: pointer; }
.bstatus.error { background: #fecaca; color: #dc2626; }
.bx { width: 26px; height: 26px; border-radius: 7px; border: none; background: transparent; color: var(--c-ink-mute); display: grid; place-items: center; transition: all 0.15s; flex-shrink: 0; }
.bx:hover { background: #fee2e2; color: #dc2626; }
.batch-count { font-size: 12px; color: var(--c-ink-mute); margin-top: 10px; text-align: right; }

.flow { margin-top: 20px; }
.flow-label { font-size: 12px; font-weight: 600; color: var(--c-ink-mute); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
.fmt-options { display: flex; gap: 8px; }
.fmt-opt { flex: 1; padding: 11px 8px; border-radius: 11px; border: 2px solid var(--c-line); background: #fff; cursor: pointer; text-align: center; transition: all 0.15s; font-size: 13px; font-weight: 700; }
.fmt-opt:hover { border-color: #94a3b8; }
.fmt-opt.sel { border-color: var(--c-brand); background: var(--c-brand-soft); color: var(--c-brand-dd); }
.flow-hint { font-size: 12px; color: var(--c-ink-mute); margin-top: 8px; }

.conv-action { margin-top: 16px; }
.btn-convert {
  width: 100%; padding: 15px; border-radius: 13px; border: none;
  background: linear-gradient(135deg, var(--c-brand), var(--c-brand-d));
  color: #fff; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.5);
  transition: transform 0.15s, box-shadow 0.2s;
}
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
.btn-download {
  width: 100%; padding: 12px; border-radius: 11px; border: none;
  background: var(--c-ink); color: #fff; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.2s;
}
.btn-download:hover { background: #1e293b; }
</style>
