<template>
  <article class="record-card" :style="{ '--i': index }">
    <span class="card-badge" :class="record.type === 'reverse' ? 'reverse' : 'smurf'">
      {{ record.type === 'reverse' ? '反' : '炸' }}
    </span>
    <div class="card-top">
      <span class="card-date">{{ record.date }}</span>
      <span class="card-id">{{ record.id }}</span>
    </div>
    <div v-if="record.images && record.images.length" class="card-images">
      <div v-for="(src, j) in record.images" :key="j" class="card-img-slot has-image">
        <img :src="src" alt="截图" loading="lazy">
      </div>
    </div>
    <div v-if="record.note" class="card-note">{{ record.note }}</div>
  </article>
</template>

<script setup>
defineProps({
  record: { type: Object, required: true },
  index: { type: Number, default: 0 },
})
</script>
