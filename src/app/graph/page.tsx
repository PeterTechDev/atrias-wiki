import GraphClient from './GraphClient'

export const dynamic = 'force-dynamic'

export default function GraphPage() {
  return (
    <main className="min-h-screen bg-[#050b14]">
      <h1 className="sr-only">Graph</h1>

      {/* Canvas region */}
      <div className="relative">
        <GraphClient />
      </div>
    </main>
  )
}
