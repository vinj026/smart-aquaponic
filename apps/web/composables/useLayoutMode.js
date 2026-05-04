import { onMounted, watch } from 'vue'
import { useState } from '#imports'

const STORAGE_KEY = 'aquaguard-layout-mode'

export function useLayoutMode() {
  const isDesktopLayout = useState('isDesktopLayout', () => false)

  onMounted(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'desktop') isDesktopLayout.value = true
    else if (stored === 'mobile') isDesktopLayout.value = false
    else isDesktopLayout.value = window.innerWidth >= 1024
  })

  watch(isDesktopLayout, (enabled) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'desktop' : 'mobile')
  })

  function toggleLayoutMode() {
    isDesktopLayout.value = !isDesktopLayout.value
  }

  return { isDesktopLayout, toggleLayoutMode }
}
