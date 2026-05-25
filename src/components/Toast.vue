<template>
  <div class="toast" :class="{ show: toast.show, error: toast.type === 'error' }">{{ toast.msg }}</div>
</template>

<script setup>
defineProps({
  toast: { type: Object, required: true },
})
</script>
