import { describe, expect, it } from 'vitest'
import { filterPhotos } from './filterPhotos'
import type { PhotoRecord, PhotoTag, Tag, TagGroup } from '../types'

const groupScene: TagGroup = { id: 'scene', name: '场景', color: '#d68b5d', sortOrder: 0, createdAt: 1, updatedAt: 1 }
const groupMood: TagGroup = { id: 'mood', name: '氛围', color: '#7b8fb2', sortOrder: 1, createdAt: 1, updatedAt: 1 }
const mountain: Tag = { id: 'mountain', groupId: 'scene', name: '高山', createdAt: 1, updatedAt: 1 }
const sky: Tag = { id: 'sky', groupId: 'scene', name: '蓝天', createdAt: 1, updatedAt: 1 }
const warm: Tag = { id: 'warm', groupId: 'mood', name: '暖色', createdAt: 1, updatedAt: 1 }
const photos = ['one.jpg', 'two.jpg', 'three.jpg'].map((fileName, index): PhotoRecord => ({
  id: `photo-${index + 1}`,
  fileName,
  mimeType: 'image/jpeg',
  size: 10,
  width: 100,
  height: 100,
  blob: new Blob(),
  importedAt: index,
  lastModified: index,
}))
const relations: PhotoTag[] = [
  { photoId: 'photo-1', tagId: 'mountain', createdAt: 1 },
  { photoId: 'photo-1', tagId: 'warm', createdAt: 1 },
  { photoId: 'photo-2', tagId: 'sky', createdAt: 1 },
  { photoId: 'photo-2', tagId: 'warm', createdAt: 1 },
]

describe('filterPhotos', () => {
  it('returns all photos when no filters are active', () => {
    expect(filterPhotos(photos, relations, [mountain, sky, warm], [groupScene, groupMood], '', {})).toHaveLength(3)
  })

  it('uses OR within a tag group', () => {
    const result = filterPhotos(photos, relations, [mountain, sky, warm], [groupScene, groupMood], '', { scene: ['mountain', 'sky'] })
    expect(result.map((photo) => photo.id)).toEqual(['photo-1', 'photo-2'])
  })

  it('uses AND across tag groups', () => {
    const result = filterPhotos(photos, relations, [mountain, sky, warm], [groupScene, groupMood], '', { scene: ['mountain'], mood: ['warm'] })
    expect(result.map((photo) => photo.id)).toEqual(['photo-1'])
  })

  it('combines filename search with tag filters', () => {
    const result = filterPhotos(photos, relations, [mountain, sky, warm], [groupScene, groupMood], 'two', { mood: ['warm'] })
    expect(result.map((photo) => photo.fileName)).toEqual(['two.jpg'])
  })
})
