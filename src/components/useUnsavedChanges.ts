'use client'

import { useEffect, useRef } from 'react'
import { confirmDiscard, shouldConfirmNavigation } from '@/lib/unsavedChanges'

type NavigateEvent = Event & { destination: { url: string; sameDocument: boolean }; navigationType: string }

export function useUnsavedChanges(dirty: boolean) {
  const bypass = useRef(false)

  function allowLeave() {
    if (bypass.current || confirmDiscard(dirty, message => window.confirm(message))) {
      bypass.current = true
      return true
    }
    return false
  }

  useEffect(() => {
    if (!dirty) return
    function beforeUnload(event: BeforeUnloadEvent) {
      if (bypass.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    function click(event: MouseEvent) {
      if (bypass.current || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
      if (!shouldConfirmNavigation(window.location.href, link.href)) return
      if (confirmDiscard(true, message => window.confirm(message))) bypass.current = true
      else { event.preventDefault(); event.stopImmediatePropagation() }
    }
    // History traversal does not unload a Next.js page; use the browser's navigation event.
    const navigation = (window as Window & { navigation?: EventTarget }).navigation
    function navigate(event: Event) {
      const next = event as NavigateEvent
      if (bypass.current || !event.cancelable || next.navigationType !== 'traverse' || !next.destination.sameDocument) return
      if (!shouldConfirmNavigation(window.location.href, next.destination.url)) return
      if (confirmDiscard(true, message => window.confirm(message))) bypass.current = true
      else event.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)
    document.addEventListener('click', click, true)
    navigation?.addEventListener('navigate', navigate)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      document.removeEventListener('click', click, true)
      navigation?.removeEventListener('navigate', navigate)
    }
  }, [dirty])

  return { allowLeave, markSaved: () => { bypass.current = true } }
}
