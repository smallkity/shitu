import { useState } from 'react'
import { importPhotosFromGallery } from '../lib/repository'
import type { ImportResult } from '../types'

export function ImportButton({ onImported }: { onImported?: (r: ImportResult) => void }) {
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await importPhotosFromGallery()
      onImported?.(result)
    } catch (error) {
      console.error('[拾图] 导入失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className="import-btn"
      onClick={handleImport}
      disabled={loading}
      aria-label="从相册导入照片"
    >
      {loading ? (
        <span className="import-btn__spinner" />
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
      <span>{loading ? '导入中…' : '导入照片'}</span>
    </button>
  )
}
