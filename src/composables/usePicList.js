import { ref } from 'vue'

export function usePicList(gh, form, showToast) {
  const selectedFiles = ref([])
  const uploading = ref(false)
  const uploadProgress = ref('')
  const uploadDone = ref([])

  function onFilesSelected(e) {
    selectedFiles.value = Array.from(e.target.files || [])
    uploadDone.value = []
    e.target.value = ''
  }

  function extractUrls(data) {
    if (!data) return []
    if (data.result && Array.isArray(data.result)) return data.result.filter(u => typeof u === 'string')
    if (Array.isArray(data)) return data.filter(u => typeof u === 'string')
    if (typeof data.url === 'string') return [data.url]
    if (data.data && typeof data.data.url === 'string') return [data.data.url]
    if (data.data && Array.isArray(data.data)) return data.data.filter(u => typeof u === 'string')
    return []
  }

  async function uploadToPiclist() {
    if (!selectedFiles.value.length) return
    if (!gh.value || !gh.value.piclistUrl) {
      showToast('请先在设置中配置 PicList-Core 地址', 'error')
      return
    }

    uploading.value = true
    uploadDone.value = []
    const urls = []
    const base = gh.value.piclistUrl.replace(/\/+$/, '')

    const qs = []
    if (gh.value.picbed) qs.push('picbed=' + encodeURIComponent(gh.value.picbed))
    if (gh.value.piclistKey) qs.push('key=' + encodeURIComponent(gh.value.piclistKey))
    const uploadUrl = base + '/upload' + (qs.length ? '?' + qs.join('&') : '')

    for (let i = 0; i < selectedFiles.value.length; i++) {
      uploadProgress.value = (i + 1) + '/' + selectedFiles.value.length
      const fd = new FormData()
      fd.append('image', selectedFiles.value[i])

      try {
        const r = await fetch(uploadUrl, { method: 'POST', body: fd })
        if (!r.ok) throw new Error('HTTP ' + r.status)
        const data = await r.json()

        const extracted = extractUrls(data)
        if (!extracted.length) throw new Error('未识别到返回 URL')
        urls.push(...extracted)
      } catch (e) {
        const emsg = e.message || ''
        if (emsg.includes('CORS') || emsg.includes('cross') || emsg.includes('Failed to fetch') || emsg.includes('NetworkError')) {
          showToast('上传失败：PicList-Core CORS 未配置，请允许 ' + location.origin + ' 来源', 'error')
        } else {
          showToast('上传失败 (' + (i + 1) + '/' + selectedFiles.value.length + '): ' + emsg, 'error')
        }
        uploading.value = false
        uploadProgress.value = ''
        return
      }
    }

    uploadDone.value = urls
    const existing = form.images.trim()
    form.images = (existing ? existing + ', ' : '') + urls.join(', ')
    selectedFiles.value = []
    uploading.value = false
    uploadProgress.value = ''
    showToast('已上传 ' + urls.length + ' 张截图，URL 已填入')
  }

  return { selectedFiles, uploading, uploadProgress, uploadDone, onFilesSelected, uploadToPiclist }
}
