import Link from 'next/link'

export default function DemoPage() {
  return <main className="min-h-screen bg-zinc-900 p-8 text-zinc-100"><div className="mx-auto max-w-2xl"><Link href="/" className="text-amber-400">← Voltar</Link><h1 className="mt-8 text-3xl font-bold text-amber-400">Demo indisponível</h1><p className="mt-4 text-zinc-300">A demonstração foi desativada para não expor cópias de entidades fora da fonte filtrada da wiki.</p></div></main>
}
