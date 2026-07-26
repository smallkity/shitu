import { useEffect, useState } from 'react'
import { getPhotoUrl } from '../lib/repository'

export function PhotoImage({
  filePath,
  alt,
  className,
}: {
  filePath: string
  alt: string
  className?: string
}) {
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    const url = getPhotoUrl(filePath)
    setSrc(url)
    return () => {
      // convertFileSrc 返回的是原生协议 URL，不需要 revoke
    }
  }, [filePath])

  if (!src) {
    return <div className={`${className ?? ''} photo-placeholder`} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        console.error('[拾图] 图片加载失败:', filePath)
        ;(e.target as HTMLImageElement).style.opacity = '0.2'
      }}
    />
  )
}
