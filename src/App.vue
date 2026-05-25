<template>
  <div class="container">
    <SiteHeader
      :records-count="records.length"
      :has-pending="hasPending"
      :pending-count="pendingCount"
      :submitting-gh="submittingGh"
      :gh-dot-class="ghDotClass"
      :gh-dot-title="ghDotTitle"
      @submit-github="submitToGitHub"
      @open-settings="openSettings"
    />

    <MasonryLayout
      :records="records"
      :loading="loading"
      v-model:masonry-ref="masonryRef"
    />

    <footer class="site-footer">
      <p><span class="dot"></span>炸鱼指利用不当手段影响对局平衡</p>
    </footer>
  </div>

  <button v-if="editEnabled" class="fab" @click="openAdd" title="添加记录">+</button>

  <AddEditModal
    :show="showAdd"
    :editing-index="editingIndex"
    :form="form"
    :piclist-configured="piclistConfigured"
    :selected-files="selectedFiles"
    :uploading="uploading"
    :upload-progress="uploadProgress"
    :upload-done="uploadDone"
    :submitting="submitting"
    @close="closeAddModal"
    @clear-draft="clearDraft"
    @files-selected="onFilesSelected"
    @upload-piclist="uploadToPiclist"
    @submit-record="submitRecord"
  />

  <SettingsModal
    :show="showSettings"
    :gh-form="ghForm"
    :filtered-records="filteredRecords"
    :search-query="searchQuery"
    :edit-enabled="editEnabled"
    :test-gh-label="testGhLabel"
    :test-gh-ok="testGhOk"
    :test-pic-label="testPicLabel"
    :test-pic-ok="testPicOk"
    @close="showSettings = false"
    @save-settings="saveSettings"
    @test-gh="testGhConnection"
    @test-pic="testPicConnection"
    @start-edit="startEdit"
    @delete-record="deleteRecord"
    @enable-editing="enableEditing"
    @update:search-query="searchQuery = $event"
  />

  <Toast :toast="toast" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import MasonryLayout from './components/MasonryLayout.vue'
import AddEditModal from './components/AddEditModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import Toast from './components/Toast.vue'

import { useGitHub } from './composables/useGitHub.js'
import { useToast } from './composables/useToast.js'
import { useFormDraft } from './composables/useFormDraft.js'
import { useStaging } from './composables/useStaging.js'
import { usePicList } from './composables/usePicList.js'
import { useMasonry } from './composables/useMasonry.js'

const LS_GH = 'smurf_log_gh'
const LS_EDIT_KEY = 'smurf_log_edit_key'
const EDIT_CODE = '114514'

const INLINE = [
  { date: '2026-05-09', id: '击杀王#12345', images: [], note: '竞技模式击杀异常偏高，全程无沟通，怀疑开挂', type: 'smurf' },
  { date: '2026-05-08', id: 'Xx_SmurfMaster_xX', images: [], note: '', type: 'smurf' },
  { date: '2026-05-07', id: '别打我头#666', images: [], note: '连续三局 ACS > 400，队友举报后仍在排位中活跃', type: 'smurf' },
  { date: '2026-05-06', id: 'TwitchTV_ProMax', images: [], note: '直播标题写着「帮粉丝上分」', type: 'smurf' },
  { date: '2026-05-05', id: '瞄准全靠锁#999', images: [], note: '', type: 'reverse' },
]

function debounce(fn, ms) {
  let t
  return function () { clearTimeout(t); t = setTimeout(fn, ms) }
}

/* State */
const records = ref([])
const loading = ref(true)
const gh = ref(null)
const showAdd = ref(false)
const showSettings = ref(false)
const submitting = ref(false)
const testingGh = ref(false)
const testGhOk = ref(false)
const testingPic = ref(false)
const testPicOk = ref(false)

const form = reactive({ date: '', id: '', images: '', note: '', type: 'smurf' })
const ghForm = reactive({ owner: '', repo: '', branch: 'main', token: '', piclistUrl: '', picbed: '', piclistKey: '' })
const editingIndex = ref(-1)
const submittingGh = ref(false)
const editEnabled = ref(false)
const searchQuery = ref('')

/* Composables */
const { ghGetFile, ghPutFile, ghTestConnection } = useGitHub(gh)
const { toast, showToast } = useToast()
const { saveDraftDebounced, loadFormDraft, clearFormDraft, setRestoringDraft, today } = useFormDraft(form)
const { staging, saveStaging, loadStaging, clearStaging, applyStaging, refreshRecords, hasPending, pendingCount } = useStaging(records)
const { selectedFiles, uploading, uploadProgress, uploadDone, onFilesSelected, uploadToPiclist } = usePicList(gh, form, showToast)
const { masonryRef, layoutMasonry, scheduleLayout } = useMasonry()

/* Computed */
const ghConnected = computed(() => gh.value && gh.value.token)
const piclistConfigured = computed(() => gh.value && gh.value.piclistUrl)
const ghDotClass = computed(() => ghConnected.value ? 'header-dot online' : 'header-dot offline')
const ghDotTitle = computed(() =>
  ghConnected.value
    ? 'GitHub 已连接 — ' + gh.value.owner + '/' + gh.value.repo
    : 'GitHub 未连接 — 点齿轮设置'
)
const testGhLabel = computed(() => testingGh.value ? '测试中...' : testGhOk.value ? 'GitHub ✓' : '测试 GitHub')
const testPicLabel = computed(() => testingPic.value ? '测试中...' : testPicOk.value ? '图床 ✓' : '测试图床')

/* Actions */
function openAdd() {
  editingIndex.value = -1
  const draft = loadFormDraft()
  setRestoringDraft(true)
  form.date = draft ? draft.date || today() : today()
  form.id = draft ? draft.id || '' : ''
  form.images = draft ? draft.images || '' : ''
  form.note = draft ? draft.note || '' : ''
  form.type = draft ? draft.type || 'smurf' : 'smurf'
  selectedFiles.value = []
  uploadDone.value = []
  uploading.value = false
  showAdd.value = true
  nextTick(() => { setRestoringDraft(false) })
}

function closeAddModal() {
  showAdd.value = false
  editingIndex.value = -1
}

function clearDraft() {
  form.date = today()
  form.id = ''
  form.images = ''
  form.note = ''
  form.type = 'smurf'
  selectedFiles.value = []
  uploadDone.value = []
  uploading.value = false
  clearFormDraft()
}

function openSettings() {
  if (gh.value) {
    ghForm.owner = gh.value.owner || ''
    ghForm.repo = gh.value.repo || ''
    ghForm.branch = gh.value.branch || 'main'
    ghForm.token = gh.value.token || ''
    ghForm.piclistUrl = gh.value.piclistUrl || ''
    ghForm.picbed = gh.value.picbed || ''
    ghForm.piclistKey = gh.value.piclistKey || ''
  } else {
    ghForm.owner = ''
    ghForm.repo = ''
    ghForm.branch = 'main'
    ghForm.token = ''
    ghForm.piclistUrl = ''
    ghForm.picbed = ''
    ghForm.piclistKey = ''
  }
  showSettings.value = true
}

function saveSettings() {
  const s = {
    owner: ghForm.owner.trim(),
    repo: ghForm.repo.trim(),
    branch: ghForm.branch.trim() || 'main',
    token: ghForm.token.trim(),
    piclistUrl: ghForm.piclistUrl.trim(),
    picbed: ghForm.picbed.trim(),
    piclistKey: ghForm.piclistKey.trim(),
  }
  gh.value = s
  localStorage.setItem(LS_GH, JSON.stringify(s))
  showSettings.value = false
  loadRecords()
  showToast('设置已保存')
}

async function testGhConnection() {
  const s = { owner: ghForm.owner.trim(), repo: ghForm.repo.trim(), token: ghForm.token.trim() }
  if (!s.owner || !s.repo || !s.token) { showToast('请先填写完整 GitHub 信息', 'error'); return }
  const old = gh.value
  gh.value = s
  testingGh.value = true
  testGhOk.value = false
  try {
    const ok = await ghTestConnection()
    testGhOk.value = ok
    showToast(ok ? 'GitHub 连接成功' : 'GitHub 连接失败', ok ? '' : 'error')
  } catch (e) {
    testGhOk.value = false
    showToast('GitHub: ' + e.message, 'error')
  }
  gh.value = old
  testingGh.value = false
}

async function testPicConnection() {
  const url = ghForm.piclistUrl.trim()
  if (!url) { showToast('请先填写 PicList-Core 服务地址', 'error'); return }
  testingPic.value = true
  testPicOk.value = false
  try {
    await fetch(url.replace(/\/+$/, ''), { method: 'GET', mode: 'no-cors' })
    testPicOk.value = true
    showToast('图床服务可达')
  } catch (e) {
    testPicOk.value = false
    showToast('图床不可达: ' + e.message, 'error')
  }
  testingPic.value = false
}

async function submitRecord() {
  if (!form.id.trim()) { showToast('请填写炸鱼哥 ID', 'error'); return }
  submitting.value = true
  const imgs = form.images.trim()
  const record = {
    date: form.date || today(),
    id: form.id.trim(),
    images: imgs ? imgs.split(',').map(s => s.trim()) : [],
    note: form.note.trim(),
    type: form.type || 'smurf',
  }
  const wasEdit = editingIndex.value >= 0 || editingIndex.value === -2
  if (editingIndex.value >= 0) {
    staging.edits[editingIndex.value] = record
  } else if (editingIndex.value === -2) {
    const pi = -(editingIndex.value + 2)
    if (pi >= 0 && pi < staging.pending.length) {
      record._pending = true
      staging.pending.splice(pi, 1, record)
    }
  } else {
    record._pending = true
    staging.pending.push(record)
  }
  saveStaging()
  refreshRecords()
  clearFormDraft()
  showAdd.value = false
  editingIndex.value = -1
  showToast(wasEdit ? '已保存编辑' : '已暂存，点提交到 GitHub 推送')
  submitting.value = false
}

async function submitToGitHub() {
  if (!gh.value || !gh.value.token) { showToast('请先配置 GitHub 设置', 'error'); return }
  if (!hasPending.value) { showToast('没有待提交的变更', 'error'); return }
  submittingGh.value = true
  try {
    const c = await ghGetFile()
    const merged = applyStaging(c.content)
    const count = pendingCount.value
    await ghPutFile(merged, c.sha, '同步本地变更 (' + count + ' 条)')
    clearStaging()
    staging.base = merged
    staging.sha = ''
    records.value = merged
    showToast('已提交 ' + count + ' 条变更到 GitHub')
  } catch (e) {
    showToast('提交失败：' + e.message, 'error')
  }
  submittingGh.value = false
}

function startEdit(idx) {
  const filtered = filteredRecords.value
  const r = filtered[idx]
  if (!r) return
  if (r._pending) {
    editingIndex.value = -2
    const pi = staging.pending.indexOf(r)
    if (pi >= 0) editingIndex.value = -2 - pi
  } else {
    const bi = staging.base.indexOf(r)
    editingIndex.value = bi >= 0 ? bi : -1
  }
  form.date = r.date || today()
  form.id = r.id || ''
  form.images = (r.images || []).join(', ')
  form.note = r.note || ''
  form.type = r.type || 'smurf'
  showAdd.value = true
}

function deleteRecord(idx) {
  const filtered = filteredRecords.value
  const r = filtered[idx]
  if (!r) return
  if (r._pending) {
    const pi = staging.pending.indexOf(r)
    if (pi >= 0) staging.pending.splice(pi, 1)
  } else {
    const bi = staging.base.indexOf(r)
    if (bi >= 0) {
      delete staging.edits[bi]
      staging.deletes.push(bi)
    }
  }
  saveStaging()
  refreshRecords()
  showToast('已标记删除: ' + r.id)
}

function loadGhSettings() {
  try { gh.value = JSON.parse(localStorage.getItem(LS_GH)) } catch (_) { gh.value = null }
  if (!gh.value) gh.value = {}
}

async function loadRecords() {
  loading.value = true
  try {
    loadStaging()
    let data = null
    let sha = ''
    if (gh.value && gh.value.token) {
      try {
        const c = await ghGetFile()
        data = c.content
        sha = c.sha
      } catch (e) { console.warn('GitHub:', e.message) }
    }
    if (!data) {
      try {
        const r = await fetch('records.json?' + Date.now())
        if (r.ok) data = await r.json()
      } catch (_) {}
    }
    if (!data) data = INLINE
    staging.base = data
    staging.sha = sha
    saveStaging()
    refreshRecords()
  } finally {
    loading.value = false
  }
}

/* filteredRecords (shared between App and SettingsModal) */
const filteredRecords = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return records.value
  return records.value.filter(r =>
    (r.id && r.id.toLowerCase().includes(q)) || (r.note && r.note.toLowerCase().includes(q))
  )
})

function onKeydown(e) {
  if (e.key === 'Escape') {
    showAdd.value = false
    showSettings.value = false
    editingIndex.value = -1
  }
}

function enableEditing(code) {
  if (code === EDIT_CODE) {
    editEnabled.value = true
    localStorage.setItem(LS_EDIT_KEY, '1')
    showToast('编辑功能已启用')
    return true
  }
  showToast('口令错误', 'error')
  return false
}

/* Lifecycle */
onMounted(async () => {
  form.date = today()
  editEnabled.value = localStorage.getItem(LS_EDIT_KEY) === '1'
  loadGhSettings()
  await loadRecords()
  await nextTick()
  layoutMasonry()
  document.addEventListener('keydown', onKeydown)
  const observer = new MutationObserver(() => scheduleLayout())
  observer.observe(masonryRef.value || document.body, { childList: true, subtree: true })
  window.addEventListener('resize', debounce(layoutMasonry, 200))
})

watch(() => ({ ...form }), () => { saveDraftDebounced() }, { deep: true })
watch(records, () => { scheduleLayout() })
</script>
