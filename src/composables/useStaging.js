import { reactive, computed } from 'vue'

const LS_STAGING = 'smurf_log_staging'

export function useStaging(records) {
  const staging = reactive({ sha: '', base: [], pending: [], edits: {}, deletes: [] })

  function saveStaging() {
    try {
      localStorage.setItem(LS_STAGING, JSON.stringify({
        sha: staging.sha, base: staging.base, pending: staging.pending,
        edits: staging.edits, deletes: staging.deletes,
      }))
    } catch (_) {}
  }

  function loadStaging() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_STAGING))
      if (d) {
        staging.sha = d.sha || ''
        staging.base = d.base || []
        staging.pending = d.pending || []
        staging.edits = d.edits || {}
        staging.deletes = d.deletes || []
      }
    } catch (_) {}
  }

  function clearStaging() {
    staging.sha = ''
    staging.base = []
    staging.pending = []
    staging.edits = {}
    staging.deletes = []
    try { localStorage.removeItem(LS_STAGING) } catch (_) {}
  }

  function applyStaging(base) {
    const result = base.slice()
    for (const k in staging.edits) {
      const idx = parseInt(k)
      if (idx >= 0 && idx < result.length) result[idx] = staging.edits[k]
    }
    staging.deletes.slice().sort((a, b) => b - a).forEach(idx => {
      if (idx >= 0 && idx < result.length) result.splice(idx, 1)
    })
    result.push(...staging.pending)
    result.sort((a, b) => a.date === b.date ? 0 : a.date < b.date ? 1 : -1)
    return result
  }

  function refreshRecords() {
    records.value = applyStaging(staging.base)
  }

  const hasPending = computed(() =>
    staging.pending.length > 0 || Object.keys(staging.edits).length > 0 || staging.deletes.length > 0
  )
  const pendingCount = computed(() =>
    staging.pending.length + Object.keys(staging.edits).length + staging.deletes.length
  )

  return { staging, saveStaging, loadStaging, clearStaging, applyStaging, refreshRecords, hasPending, pendingCount }
}
