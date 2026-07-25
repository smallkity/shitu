import { useRef, useState } from 'react'
import { ImagePlus } from './Icons'
import { importPhotoFiles } from '../lib/repository'

interface ImportButtonProps {
  onImported: (message: string) => void
}

export function ImportButton({ onImported }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    setImporting(true)
    try {
      const result = await importPhotoFiles(files)
      const failedText = result.failed.length > 0 ? `，${result.failed.length} 张失败` : ''
      onImported(`已导入 ${result.imported} 张${result.skipped > 0 ? `，跳过 ${result.skipped} 张重复照片` : ''}${failedText}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
      <button className="primary-button" onClick={() => inputRef.current?.click()} disabled={importing}>
        <ImagePlus size={18} />
        {importing ? '正在导入…' : '导入照片'}
      </button>
    </>
  )
}
