import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { PhotoRecord } from '../types'

interface PhotoImageProps {
  photo: PhotoRecord
  alt?: string
  className?: string
}

export function PhotoImage({ photo, alt = photo.fileName, className = '' }: PhotoImageProps) {
  const [src, setSrc] = useState<string>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob)
    setSrc(objectUrl)
    setFailed(false)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo.blob])

  if (failed || !src) {
    return (
      <div className={`photo-image-fallback ${className}`}>
        <ImageOff size={24} strokeWidth={1.5} />
        <span>无法预览</span>
      </div>
    )
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
