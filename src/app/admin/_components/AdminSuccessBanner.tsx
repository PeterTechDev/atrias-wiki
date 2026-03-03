'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react'

type SuccessKind = 'created' | 'updated'

function getBannerCopy(kind: SuccessKind) {
  if (kind === 'created') {
    return {
      text: 'Entity created successfully.',
      className: 'border-green-300 bg-green-50 text-green-900',
      iconClassName: 'text-green-700',
    }
  }

  return {
    text: 'Entity updated successfully.',
    className: 'border-amber-300 bg-amber-50 text-amber-900',
    iconClassName: 'text-amber-700',
  }
}

export function AdminSuccessBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const success = searchParams.get('success')

  const kind = useMemo(() => {
    if (success === 'created' || success === 'updated') return success
    return null
  }, [success])

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Reset visibility when navigating between lists.
    setVisible(true)
  }, [kind])

  useEffect(() => {
    if (!kind) return
    if (!visible) return

    const t = window.setTimeout(() => {
      setVisible(false)
    }, 3000)

    return () => window.clearTimeout(t)
  }, [kind, visible])

  useEffect(() => {
    if (!kind) return
    if (visible) return

    const next = new URLSearchParams(searchParams.toString())
    next.delete('success')
    const qs = next.toString()

    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [kind, visible, pathname, router, searchParams])

  if (!kind || !visible) return null

  const copy = getBannerCopy(kind)

  return (
    <button
      type="button"
      onClick={() => setVisible(false)}
      className={`w-full rounded border px-4 py-3 text-left text-sm ${copy.className}`}
    >
      <div className="flex items-start gap-2">
        <Icon icon="game-icons:check-mark" className={`w-5 h-5 mt-0.5 ${copy.iconClassName}`} />
        <div className="flex-1">{copy.text}</div>
        <Icon icon="game-icons:cancel" className="w-4 h-4 opacity-70" />
      </div>
    </button>
  )
}
