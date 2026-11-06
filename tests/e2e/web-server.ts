import net from 'node:net'
import { spawn } from 'node:child_process'
import { ensureLocalMapFixture, localMapDatabaseUrl } from './local-db'

const port = Number(process.env.MAP_E2E_PORT ?? '3100')

function assertPortFree(listenPort: number) {
  return new Promise<void>((resolve, reject) => {
    const probe = net.createServer()
    probe.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(
          `A porta ${listenPort} já está em uso. Este e2e não reutiliza outro servidor. Encerre esse processo ou escolha outra MAP_E2E_PORT.`
        ))
        return
      }
      reject(error)
    })
    probe.listen(listenPort, '127.0.0.1', () => {
      probe.close(() => resolve())
    })
  })
}

async function main() {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('MAP_E2E_PORT precisa ser uma porta TCP válida.')
    process.exit(1)
  }

  let databaseUrl: string
  try {
    databaseUrl = localMapDatabaseUrl()
    await assertPortFree(port)
    await ensureLocalMapFixture(databaseUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    if (!message.includes('Recusando escrita') && !message.includes('já está em uso') && !message.includes('MAP_E2E_')) {
      console.error('Crie a role atrias_e2e e o banco atrias_wiki_e2e só em 127.0.0.1, como em tests/e2e/README.md.')
    }
    process.exit(1)
  }

  const child = spawn(
    'npx',
    ['next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl, MAP_E2E_PORT: String(port) },
    }
  )

  const stop = () => {
    if (!child.killed) child.kill('SIGTERM')
  }
  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
  child.on('exit', (code, signal) => {
    if (signal) process.exit(0)
    process.exit(code ?? 0)
  })
}

void main()
