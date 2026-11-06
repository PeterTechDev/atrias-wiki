import { expect, test, type Locator, type Page } from '@playwright/test'
import { mapLocations } from '../../src/lib/mapLocations'

// Strings already present on the map. Nothing here is invented wiki copy.
const ABRIGO = {
  name: 'Abrigo de Solária',
  type: 'Vila',
  description: 'Uma vila acolhedora nas Colinas do Serpeio',
  slug: 'abrigo-de-solaria',
} as const

const MAP_JPEG = { path: '/world-map.jpg', width: 8192, height: 7842 } as const

// The image overlay has no accessible name. Marker icons are role=button via Leaflet,
// but the sidebar repeats the same name, so marker geometry is scoped to the map widget.
// toBeVisible is not used: a layer outside the canvas still has a box.
const mapCanvas = (page: Page) => page.locator('.leaflet-container')
const imageLayer = (page: Page) => mapCanvas(page).locator('img.leaflet-image-layer')
const markerLayer = (page: Page, title: string) => mapCanvas(page).getByRole('button', { name: title, exact: true })
const loadingText = (page: Page) => page.getByText('Carregando mapa...')
const mapAlert = (page: Page) => page.getByRole('alert').filter({ hasText: 'Não foi possível carregar o mapa.' })

type LayerBox = {
  position: string
  width: number
  height: number
  fullyInside: boolean
  centerInside: boolean
  canvasCover: number
  naturalWidth: number
  naturalHeight: number
  path: string
}

async function layerBox(locator: Locator): Promise<LayerBox> {
  return locator.evaluate((el) => {
    const canvas = el.closest('.leaflet-container')
    if (!(canvas instanceof HTMLElement)) throw new Error('Camada fora de .leaflet-container')
    const layer = el.getBoundingClientRect()
    const box = canvas.getBoundingClientRect()
    const tolerance = 2
    const cx = layer.left + layer.width / 2
    const cy = layer.top + layer.height / 2
    const left = Math.max(layer.left, box.left)
    const right = Math.min(layer.right, box.right)
    const top = Math.max(layer.top, box.top)
    const bottom = Math.min(layer.bottom, box.bottom)
    const intersection = Math.max(0, right - left) * Math.max(0, bottom - top)
    const canvasArea = box.width * box.height
    let path = ''
    if (el instanceof HTMLImageElement) {
      try {
        path = new URL(el.currentSrc || el.src).pathname
      } catch {
        path = ''
      }
    }
    return {
      position: getComputedStyle(el).position,
      width: layer.width,
      height: layer.height,
      fullyInside:
        layer.width > 0 &&
        layer.height > 0 &&
        layer.left >= box.left - tolerance &&
        layer.right <= box.right + tolerance &&
        layer.top >= box.top - tolerance &&
        layer.bottom <= box.bottom + tolerance,
      centerInside: cx >= box.left && cx <= box.right && cy >= box.top && cy <= box.bottom,
      canvasCover: canvasArea > 0 ? intersection / canvasArea : 0,
      naturalWidth: el instanceof HTMLImageElement ? el.naturalWidth : 0,
      naturalHeight: el instanceof HTMLImageElement ? el.naturalHeight : 0,
      path,
    }
  })
}

function imageProblems(box: LayerBox) {
  const problems: string[] = []
  if (box.position !== 'absolute') problems.push(`position=${box.position}`)
  if (box.naturalWidth !== MAP_JPEG.width || box.naturalHeight !== MAP_JPEG.height) {
    problems.push(`natural=${box.naturalWidth}x${box.naturalHeight}`)
  }
  if (box.path !== MAP_JPEG.path) problems.push(`path=${box.path}`)
  // minZoom -2 keeps the JPEG larger than the canvas, so the painted map is the
  // portion covering the canvas rather than the whole image sitting inside it.
  if (box.canvasCover < 0.9) problems.push(`cobertura=${box.canvasCover.toFixed(3)}`)
  return problems
}

async function expectImageInCanvas(page: Page) {
  const image = imageLayer(page)
  await expect(image).toHaveCount(1)
  await expect.poll(async () => imageProblems(await layerBox(image)).join('; ') || 'ok').toBe('ok')
}

async function expectMarkerInCanvas(page: Page, title: string) {
  const marker = markerLayer(page, title)
  await expect(marker).toHaveCount(1)
  await expect.poll(async () => {
    const box = await layerBox(marker)
    const problems = [
      ...(box.position !== 'absolute' ? [`position=${box.position}`] : []),
      ...(!box.centerInside ? ['centro fora do canvas'] : []),
      ...(box.width < 12 || box.height < 12 ? [`tamanho ${Math.round(box.width)}x${Math.round(box.height)}`] : []),
    ]
    return problems.join('; ') || 'ok'
  }).toBe('ok')
}

async function focusAbrigo(page: Page, projectName: string) {
  const listName = `${ABRIGO.name} ${ABRIGO.type}`
  const listButton = projectName === 'mobile'
    ? page.getByRole('button', { name: listName })
    : page.getByRole('complementary').getByRole('button', { name: ABRIGO.name, exact: true })
  if (projectName === 'mobile') await page.getByRole('button', { name: 'Locais', exact: true }).click()
  await listButton.click()
  await expectMarkerInCanvas(page, ABRIGO.name)
  await expectImageInCanvas(page)
}

async function paintFrames(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
  )
}

test('mostra a imagem e os marcadores dentro do canvas', async ({ page }, testInfo) => {
  const jpeg: number[] = []
  page.on('response', (response) => {
    if (new URL(response.url()).pathname === MAP_JPEG.path) jpeg.push(response.status())
  })
  await page.goto('/map')
  await expect(page.getByRole('heading', { name: 'Mapa do Mundo' })).toBeVisible()
  await expect(loadingText(page)).toHaveCount(0)
  await expect(mapAlert(page)).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Aproximar mapa' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Afastar mapa' })).toBeVisible()
  await expectImageInCanvas(page)
  for (const location of mapLocations) {
    await expect(markerLayer(page, location.name)).toHaveCSS('position', 'absolute')
  }
  await focusAbrigo(page, testInfo.project.name)
  expect(jpeg).toContain(200)
})

test('permanece carregando até o JPEG passar da barreira', async ({ page }) => {
  let releaseGate: () => void = () => {}
  const gate = new Promise<void>((resolve) => {
    releaseGate = resolve
  })
  let requested = 0
  await page.route(`**${MAP_JPEG.path}`, async (route) => {
    requested += 1
    await gate
    try {
      await route.continue()
    } catch {
      // A remount can abort the withheld request. The replacement waits on the same gate.
    }
  })

  await page.goto('/map')
  await expect.poll(() => requested).toBeGreaterThan(0)
  await expect.poll(async () => {
    const counts = await Promise.all(mapLocations.map((location) => markerLayer(page, location.name).count()))
    return counts.reduce((sum, count) => sum + count, 0)
  }).toBe(mapLocations.length)
  await paintFrames(page)
  await expect(loadingText(page)).toBeVisible()
  await expect(mapAlert(page)).toHaveCount(0)
  const withheld = await imageLayer(page).evaluate((el) => (el instanceof HTMLImageElement ? el.naturalWidth : -1))
  expect(withheld).toBe(0)

  releaseGate()
  await expect(loadingText(page)).toHaveCount(0)
  await expectImageInCanvas(page)
  await focusAbrigo(page, test.info().project.name)
})

test('JPEG com falha mostra o erro e a nova tentativa revela o mapa', async ({ page }) => {
  let allowImage = false
  let failures = 0
  let successes = 0
  await page.route(`**${MAP_JPEG.path}`, async (route) => {
    if (!allowImage) {
      failures += 1
      await route.fulfill({ status: 500, contentType: 'text/plain', body: 'falha controlada do mapa' })
      return
    }
    successes += 1
    await route.continue()
  })

  await page.goto('/map')
  await expect(mapAlert(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
  await expect(loadingText(page)).toHaveCount(0)
  expect(failures).toBeGreaterThan(0)

  allowImage = true
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(mapAlert(page)).toHaveCount(0)
  await expect(loadingText(page)).toHaveCount(0)
  await expectImageInCanvas(page)
  await focusAbrigo(page, test.info().project.name)
  expect(successes).toBeGreaterThan(0)
})

test('permanece no canvas com o CSS do unpkg bloqueado', async ({ page }) => {
  const blocked: string[] = []
  await page.route('**/unpkg.com/**', async (route) => {
    blocked.push(route.request().url())
    await route.abort('failed')
  })
  await page.goto('/map')
  await expect(loadingText(page)).toHaveCount(0)
  await expectImageInCanvas(page)
  await focusAbrigo(page, test.info().project.name)
  await expect(markerLayer(page, ABRIGO.name)).toHaveCSS('position', 'absolute')
  test.info().annotations.push({
    type: 'unpkg-blocked',
    description: blocked.length === 0 ? 'nenhum request a unpkg.com' : blocked.join(' '),
  })
})

test('deep link abrigo-de-solaria deixa o marcador dentro do canvas', async ({ page }) => {
  await page.goto(`/map?place=${ABRIGO.slug}`)
  await expect(loadingText(page)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: ABRIGO.name })).toBeVisible()
  await expect(page.getByText(ABRIGO.type, { exact: true })).toBeVisible()
  await expect(page.getByText(ABRIGO.description)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver página completa' })).toHaveAttribute('href', `/places/${ABRIGO.slug}`)
  await expect(page.getByRole('button', { name: 'Fechar informações do lugar' })).toBeVisible()
  await expectImageInCanvas(page)
  await expectMarkerInCanvas(page, ABRIGO.name)
})
