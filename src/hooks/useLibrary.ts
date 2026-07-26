import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { ensureSeedData } from '../lib/seed'
import type { LibrarySnapshot } from '../types'

export function useLibrary(): LibrarySnapshot & { loading: boolean } {
  const photos = useLiveQuery(() => db.photos.toArray(), [])
  const tagGroups = useLiveQuery(() => db.tagGroups.orderBy('sortOrder').toArray(), [])
  const tags = useLiveQuery(() => db.tags.toArray(), [])
  const photoTags = useLiveQuery(() => db.photoTags.toArray(), [])

  useLiveQuery(() => ensureSeedData(), [])

  const loading = !photos || !tagGroups || !tags || !photoTags

  if (loading) {
    return {
      photos: [],
      tagGroups: [],
      tags: [],
      photoTags: [],
      loading: true,
    }
  }

  return { photos, tagGroups, tags, photoTags, loading: false }
}
