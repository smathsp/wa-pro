<template>
  <header class="site-header">
    <div class="header-left">
      <h1><span class="accent">炸鱼</span>记录</h1>
      <span class="meta">共 <strong>{{ recordsCount }}</strong> 次遭遇</span>
    </div>
    <div class="header-actions">
      <button v-if="hasPending" class="btn-submit-header" :disabled="submittingGh" @click="$emit('submit-github')">
        {{ submittingGh ? '提交中...' : '提交 ' + pendingCount + ' 条' }}
      </button>
      <span :class="ghDotClass" :title="ghDotTitle"></span>
      <button class="btn-icon" @click="$emit('open-settings')" title="设置">&#9881;</button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  recordsCount: { type: Number, default: 0 },
  hasPending: { type: Boolean, default: false },
  pendingCount: { type: Number, default: 0 },
  submittingGh: { type: Boolean, default: false },
  ghDotClass: { type: String, default: 'header-dot offline' },
  ghDotTitle: { type: String, default: 'GitHub 未连接' },
})

defineEmits(['submit-github', 'open-settings'])
</script>
