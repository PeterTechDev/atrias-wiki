'use client'

import { useState, type ImgHTMLAttributes } from 'react'
import { ImageOff } from 'lucide-react'

export default function WikiImage(props: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()
  if (failedSrc === props.src) return <span className={props.className} role="img" aria-label="Imagem indisponível" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <ImageOff aria-hidden="true" size={28} />
  </span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt ?? ''} onError={() => setFailedSrc(props.src)} />
}
