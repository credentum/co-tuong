import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '@/store/useGameStore'

export function Toast() {
  const { t } = useTranslation()
  const toasts = useGameStore((s) => s.toasts)
  const dismissToast = useGameStore((s) => s.dismissToast)

  const latest = toasts[toasts.length - 1]

  useEffect(() => {
    if (!latest) return
    const timer = setTimeout(() => dismissToast(latest.id), 2000)
    return () => clearTimeout(timer)
  }, [latest, dismissToast])

  if (!latest) return null

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-stone-800 px-4 py-2 text-sm text-white shadow-lg">
      {t(latest.messageKey)}
    </div>
  )
}
