import { ensureLocalMapFixture } from './local-db'

export default async function globalSetup() {
  await ensureLocalMapFixture()
}
