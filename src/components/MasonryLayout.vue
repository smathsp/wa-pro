<template>
  <div class="masonry" ref="masonryRef" @click="onMasonryClick">
    <div v-if="loading" class="loading-indicator">
      <span class="loading-pulse"></span>
      <span class="loading-pulse"></span>
      <span class="loading-pulse"></span>
      加载中
    </div>
    <template v-else-if="records.length === 0">
      <div class="empty-state">
        <div class="cross-large"><div class="ring"></div></div>
        <span>暂无记录，遇到炸鱼哥后<br>点右下角 + 添加</span>
      </div>
    </template>
    <template v-for="(r, i) in records" :key="i">
      <RecordCard :record="r" :index="i" />
    </template>
  </div>
</template>

<script setup>
import RecordCard from './RecordCard.vue'

defineProps({
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const masonryRef = defineModel('masonryRef')

function onMasonryClick(e) {
  const slot = e.target.closest('.card-img-slot:not(.has-image)')
  if (!slot) return
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = 'image/*'
  inp.onchange = function () {
    const f = inp.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = function () {
      const img = document.createElement('img')
      img.src = reader.result
      img.alt = '截图'
      slot.innerHTML = ''
      slot.appendChild(img)
      slot.classList.add('has-image')
    }
    reader.readAsDataURL(f)
  }
  inp.click()
}
</script>
