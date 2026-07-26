export interface PhotoRecord {
  id: string
  fileName: string
  filePath: string
  mimeType: string
  size: number
  width: number
  height: number
  capturedAt?: number
  importedAt: number
  lastModified: number
}

export interface TagGroup {
  id: string
  name: string
  color: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

export interface Tag {
  id: string
  groupId: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface PhotoTag {
  photoId: string
  tagId: string
  createdAt: number
}

export interface AppSetting {
  key: string
  value: string
}

export interface LibrarySnapshot {
  photos: PhotoRecord[]
  tagGroups: TagGroup[]
  tags: Tag[]
  photoTags: PhotoTag[]
}

export type TagSelection = Record<string, string[]>

export interface ImportResult {
  imported: number
  skipped: number
  failed: Array<{ fileName: string; reason: string }>
}
