const LS_FORM_DRAFT = 'smurf_log_form_draft'

function today() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function debounce(fn, ms) {
  let t
  return function () { clearTimeout(t); t = setTimeout(fn, ms) }
}

export function useFormDraft(form) {
  let restoringDraft = false

  function persistFormDraft() {
    if (restoringDraft) return
    const d = { date: form.date, id: form.id, images: form.images, note: form.note, type: form.type }
    if (d.date || d.id || d.images || d.note) {
      try { localStorage.setItem(LS_FORM_DRAFT, JSON.stringify(d)) } catch (_) {}
    }
  }

  const saveDraftDebounced = debounce(persistFormDraft, 400)

  function loadFormDraft() {
    try {
      const d = JSON.parse(localStorage.getItem(LS_FORM_DRAFT))
      if (d && (d.date || d.id || d.images || d.note || d.type)) return d
    } catch (_) {}
    return null
  }

  function clearFormDraft() {
    try { localStorage.removeItem(LS_FORM_DRAFT) } catch (_) {}
  }

  function setRestoringDraft(val) { restoringDraft = val }

  return { saveDraftDebounced, loadFormDraft, clearFormDraft, setRestoringDraft, today }
}
