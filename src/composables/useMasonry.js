import { ref, nextTick } from 'vue'

export function useMasonry() {
  const masonryRef = ref(null)
  let layoutTimer = null
  let layoutRunning = false

  function layoutMasonry() {
    if (layoutRunning) return
    layoutRunning = true
    const el = masonryRef.value
    if (!el) { layoutRunning = false; return }
    const cards = el.querySelectorAll(':scope > .record-card')
    if (cards.length === 0) { layoutRunning = false; return }
    const avail = el.clientWidth
    const cols = Math.max(1, Math.floor((avail + 20) / (340 + 20)))
    el.innerHTML = ''
    const colDivs = []
    for (let i = 0; i < cols; i++) {
      const col = document.createElement('div')
      col.className = 'masonry-col'
      el.appendChild(col)
      colDivs.push(col)
    }
    cards.forEach(card => {
      let minIdx = 0
      let minH = colDivs[0].scrollHeight
      for (let i = 1; i < cols; i++) {
        const h = colDivs[i].scrollHeight
        if (h < minH) { minH = h; minIdx = i }
      }
      colDivs[minIdx].appendChild(card)
    })
    setTimeout(() => { layoutRunning = false }, 100)
  }

  function scheduleLayout() {
    clearTimeout(layoutTimer)
    layoutTimer = setTimeout(() => { nextTick().then(layoutMasonry) }, 80)
  }

  return { masonryRef, layoutMasonry, scheduleLayout }
}
