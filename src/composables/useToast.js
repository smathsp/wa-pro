import { reactive } from 'vue'

export function useToast() {
  const toast = reactive({ msg: '', type: '', show: false })
  let toastTimer = null

  function showToast(msg, type) {
    toast.msg = msg
    toast.type = type || ''
    toast.show = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toast.show = false }, 3500)
  }

  return { toast, showToast }
}
