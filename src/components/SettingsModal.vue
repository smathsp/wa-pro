<template>
  <div class="modal-overlay" :class="{ open: show }" @click.self="$emit('close')">
    <div class="modal modal-xl">
      <div class="modal-header">
        <h2>设置</h2>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="settings-grid">
          <div class="settings-col">
            <div class="col-label">GitHub</div>
            <div class="form-group">
              <label>用户名</label>
              <input type="text" v-model="ghForm.owner" placeholder="GitHub 用户名">
            </div>
            <div class="form-group">
              <label>仓库名</label>
              <input type="text" v-model="ghForm.repo" placeholder="仓库名">
            </div>
            <div class="form-group">
              <label>分支（默认 main）</label>
              <input type="text" v-model="ghForm.branch" placeholder="main">
            </div>
            <div class="form-group">
              <label>Personal Access Token</label>
              <input type="password" v-model="ghForm.token" placeholder="ghp_...">
              <span class="form-hint">需勾选 Contents 读写权限</span>
            </div>
            <button class="btn-test" :class="{ ok: testGhOk }" @click="$emit('test-gh')">
              {{ testGhLabel }}
            </button>
          </div>
          <div class="settings-col">
            <div class="col-label">PicList-Core</div>
            <div class="form-group">
              <label>服务地址</label>
              <input type="text" v-model="ghForm.piclistUrl" placeholder="http://127.0.0.1:36677">
            </div>
            <div class="form-group">
              <label>图床名称 (picbed)</label>
              <input type="text" v-model="ghForm.picbed" placeholder="backblaze">
            </div>
            <div class="form-group">
              <label>密钥 (key)</label>
              <input type="password" v-model="ghForm.piclistKey" placeholder="上传密钥">
            </div>
            <div class="form-group">
              <label>&nbsp;</label>
              <span class="form-hint">Token 仅存于浏览器 localStorage</span>
            </div>
            <button class="btn-test" :class="{ ok: testPicOk }" @click="$emit('test-pic')">
              {{ testPicLabel }}
            </button>
          </div>
        </div>

        <!-- 编辑权限验证 -->
        <div class="edit-lock" v-if="!editEnabled">
          <div class="col-label">编辑权限</div>
          <div class="edit-lock-row">
            <input type="password" v-model="accessCode" placeholder="输入口令以启用编辑" class="records-search" @keydown.enter="tryEnable">
            <button class="btn-test" @click="tryEnable">验证</button>
          </div>
          <span class="form-hint">输入口令后可新增、编辑、删除记录</span>
        </div>
        <div class="edit-lock enabled" v-else>
          <div class="col-label">编辑权限</div>
          <span class="form-hint" style="color:var(--green)">已启用</span>
        </div>

        <div class="records-manage">
          <div class="col-label">管理记录</div>
          <input type="text" class="records-search" :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" placeholder="搜索 ID 或备注...">
          <div class="records-list">
            <div v-for="(r, i) in filteredRecords" :key="i" class="record-row">
              <span class="record-row-badge" :class="r.type === 'reverse' ? 'reverse' : 'smurf'">{{ r.type === 'reverse' ? '反' : '炸' }}</span>
              <span class="record-row-date">{{ r.date }}</span>
              <span class="record-row-id">{{ r.id }}</span>
              <span v-if="r._pending" class="record-row-tag pending">NEW</span>
              <span v-if="editEnabled" class="record-row-actions">
                <button class="btn-row-action edit" @click="$emit('start-edit', i)" title="编辑">&#9998;</button>
                <button class="btn-row-action delete" @click="$emit('delete-record', i)" title="删除">&times;</button>
              </span>
            </div>
          </div>
        </div>

        <button class="btn-submit" @click="$emit('save-settings')">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  ghForm: { type: Object, required: true },
  filteredRecords: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  editEnabled: { type: Boolean, default: false },
  testGhLabel: { type: String, default: '测试 GitHub' },
  testGhOk: { type: Boolean, default: false },
  testPicLabel: { type: String, default: '测试图床' },
  testPicOk: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save-settings', 'test-gh', 'test-pic', 'start-edit', 'delete-record', 'enable-editing', 'update:searchQuery'])

const accessCode = ref('')

function tryEnable() {
  emit('enable-editing', accessCode.value)
}
</script>

<style scoped>
.edit-lock { padding-top: 18px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
.edit-lock.enabled { align-items: flex-start; }
.edit-lock-row { display: flex; gap: 8px; align-items: center; }
.edit-lock-row .records-search { flex: 1; }
</style>
