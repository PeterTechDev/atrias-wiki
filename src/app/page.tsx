/**
 * Átrias Wiki - Home Page
 */

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-amber-400">
            Átrias
          </h1>
          <p className="text-xl text-zinc-400">
            A Wiki for the World of Átrias
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <WikiCard
            emoji="👤"
            title="Characters"
            description="Heroes, villains, and everyone in between"
            href="/characters"
          />
          <WikiCard
            emoji="🗺️"
            title="Places"
            description="Cities, dungeons, and lands to explore"
            href="/places"
          />
          <WikiCard
            emoji="⚔️"
            title="Factions"
            description="Organizations, guilds, and religions"
            href="/factions"
          />
          <WikiCard
            emoji="🗡️"
            title="Items"
            description="Legendary weapons and artifacts"
            href="/items"
          />
          <WikiCard
            emoji="📜"
            title="Lore"
            description="History, legends, and prophecies"
            href="/lore"
          />
          <WikiCard
            emoji="🎲"
            title="Sessions"
            description="Adventure recaps and campaign logs"
            href="/sessions"
          />
        </div>

        <footer className="text-center mt-16 text-zinc-500">
          <p>Built with ❤️ for the Átrias RPG Group</p>
        </footer>
      </div>
    </main>
  )
}

function WikiCard({
  emoji,
  title,
  description,
  href,
}: {
  emoji: string
  title: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-amber-500 transition-colors"
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">{title}</h2>
      <p className="text-zinc-400">{description}</p>
    </a>
  )
}
