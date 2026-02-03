/**
 * Studio layout - minimal wrapper to prevent app styles from interfering
 */

export const metadata = {
  title: 'Átrias Wiki Studio',
  description: 'Content management for Átrias Wiki',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
