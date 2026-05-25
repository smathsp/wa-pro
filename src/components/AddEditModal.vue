<template>
  <div class="modal-overlay" :class="{ open: show }" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ editingIndex !== -1 ? '编辑记录' : '新增记录' }}</h2>
        <div style="display:flex;align-items:center;gap:8px">
          <button v-if="editingIndex === -1" class="btn-clear" @click="$emit('clear-draft')" title="清空表单">清空</button>
          <button class="modal-close" @click="close">&times;</button>
        </div>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group" style="flex:0 0 auto">
            <label>日期</label>
            <input type="date" v-model="form.date" style="width:auto">
          </div>
          <div class="form-group">
            <label>类型</label>
            <div class="type-toggle">
              <button type="button" class="type-btn smurf-like" :class="{ active: form.type === 'smurf' }" @click="form.type = 'smurf'">炸鱼</button>
              <button type="button" class="type-btn reverse-like" :class="{ active: form.type === 'reverse' }" @click="form.type = 'reverse'">反向炸鱼</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>炸鱼哥 ID *</label>
          <input type="text" v-model="form.id" placeholder="游戏内显示的 ID" ref="idInput">
        </div>
        <div class="form-group">
          <label>截图 URL</label>
          <input type="text" v-model="form.images" :placeholder="piclistConfigured ? '下方选择图片上传，或手动粘贴 URL' : 'https://img.smathsp.com/2026/05/xxx.jpg'">
          <span class="form-hint">多个用逗号分隔</span>
        </div>

        <div class="form-group">
          <label>本地上传 {{ piclistConfigured ? '' : '(未配置)' }}</label>
          <div class="upload-row">
            <input type="file" accept="image/*" multiple
                   @change="$emit('files-selected', $event)" ref="fileInput"
                   style="display:none">
            <button type="button" class="btn-upload" @click="$refs.fileInput.click()">
              选择图片
            </button>
            <span v-if="selectedFiles.length" class="form-hint">
              已选 {{ selectedFiles.length }} 张
            </span>
          </div>
          <button type="button" class="btn-upload"
                  :disabled="!selectedFiles.length || uploading || !piclistConfigured"
                  @click="$emit('upload-piclist')"
                  style="margin-top:6px">
            {{ uploading ? '上传中 ' + uploadProgress : '上传到图床' }}
          </button>
          <span v-if="uploadDone.length" class="upload-status">
            已上传 {{ uploadDone.length }} 张，URL 已填入输入框
          </span>
        </div>

        <div class="form-group">
          <label>备注</label>
          <textarea v-model="form.note" placeholder="可选：简单描述当时情况"></textarea>
        </div>
        <button class="btn-submit" :disabled="submitting" @click="$emit('submit-record')">
          {{ submitting ? '保存中...' : (editingIndex !== -1 ? '保存编辑' : '暂存记录') }}
        </button>
        <span class="form-hint" style="text-align:center">{{ editingIndex !== -1 ? '修改将保存到本地' : '记录将暂存到本地，点提交到 GitHub 推送' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  editingIndex: { type: Number, default: -1 },
  form: { type: Object, required: true },
  piclistConfigured: { type: Boolean, default: false },
  selectedFiles: { type: Array, default: () => [] },
  uploading: { type: Boolean, default: false },
  uploadProgress: { type: String, default: '' },
  uploadDone: { type: Array, default: () => [] },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'clear-draft', 'files-selected', 'upload-piclist', 'submit-record'])

const idInput = ref(null)

function close() {
  emit('close')
}

watch(() => props.show, (val) => {
  if (val) {
    nextTick(() => {
      if (idInput.value) idInput.value.focus()
    })
  }
})
</script>
