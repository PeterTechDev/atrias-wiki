import { LoaderCircle } from 'lucide-react'

export default function Loading() {
  return <main className="grid min-h-[calc(100dvh-4rem)] place-items-center bg-[#e8dcc8] px-6 py-16 text-[#243044]">
    <div role="status" className="flex items-center justify-center gap-3">
      <LoaderCircle aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin text-amber-800 motion-reduce:animate-none" />
      <p>Carregando página…</p>
    </div>
  </main>
}
