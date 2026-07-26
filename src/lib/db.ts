import Dexie, { type Table } from 'dexie'
import type { AppSetting, PhotoRecord, PhotoTag, Tag, TagGroup } from '../types'

export class PhotoDatabase extends Dexie {
  photos!: Table<PhotoRecord, string>
  tagGroups!: Table<TagGroup, string>
  tags!: Table<Tag, string>
  photoTags!: Table<PhotoTag, [string, string]>
  settings!: Table<AppSetting, string>

  constructor() {
    super('shitu-photo-library-v2')

    this.version(1).stores({
      photos: 'id, importedAt, fileName, filePath',
      tagGroups: 'id, sortOrder, createdAt',
      tags: 'id, groupId, createdAt',
      photoTags: '[photoId+tagId], photoId, tagId',
      settings: 'key',
    })
  }
}

export const db = new PhotoDatabase()

export function createId(prefix: string): string {
  const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  return `${prefix}_${uuid}`
}
