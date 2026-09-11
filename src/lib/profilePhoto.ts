export function profilePhotoError(file: { type: string; size: number }) {
  return !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024 || file.size === 0
    ? 'Escolha uma imagem JPG, PNG ou WebP de até 2 MB.'
    : ''
}
