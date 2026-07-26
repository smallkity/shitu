import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { db, createId } from './db'
import type { ImportResult, PhotoRecord, PhotoTag, Tag, TagGroup } from '../types'

export async function importPhotosFromGallery(): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, failed: [] }
  const now = Date.now()

  try {
    const photos = await Camera.pickImages({
      quality: 100,
      limit: 0,
    })

    if (!photos.photos || photos.photos.length === 0) {
      return result
    }

    for (const photo of photos.photos) {
      try {
        const filePath = photo.path || ''
        if (!filePath) {
          result.failed.push({ fileName: '未知文件', reason: '无法获取文件路径' })
          continue
        }

        const existing = await db.photos
          .where('filePath')
          .equals(filePath)
          .first()

        if (existing) {
          result.skipped += 1
          continue
        }

        let size = 0
        try {
          const stat = await Filesystem.stat({ path: filePath })
          size = stat.size || 0
        } catch {
          // 获取文件大小失败不阻止导入
        }

        const fileName = filePath.split('/').pop() || `照片_${Date.now()}.jpg`

        const record: PhotoRecord = {
          id: createId('photo'),
          fileName,
          filePath,
          mimeType: 'image/jpeg',
          size,
          width: 0,
          height: 0,
          importedAt: now,
          lastModified: now,
        }

        await db.photos.add(record)
        result.imported += 1
      } catch (error) {
        console.error('[拾图] 导入单张失败:', error)
        result.failed.push({ fileName: '未知', reason: '导入失败' })
      }
    }
  } catch (error) {
    console.error('[拾图] 选择照片失败:', error)
  }

  return result
}

export async function deletePhoto(photoId: string): Promise<void> {
  await db.transaction('rw', db.photos, db.photoTags, async () => {
    await db.photos.delete(photoId)
    await db.photoTags.where('photoId').equals(photoId).delete()
  })
}

export async function setPhotoTags(photoId: string, tagIds: string[]): Promise<void> {
  const uniqueTagIds = [...new Set(tagIds)]
  await db.transaction('rw', db.photoTags, async () => {
    await db.photoTags.where('photoId').equals(photoId).delete()
    if (uniqueTagIds.length > 0) {
      await db.photoTags.bulkAdd(uniqueTagIds.map((tagId): PhotoTag => ({
        photoId,
        tagId,
        createdAt: Date.now(),
      })))
    }
  })
}

export async function createTagGroup(name: string, color: string): Promise<TagGroup> {
  const now = Date.now()
  const group: TagGroup = {
    id: createId('group'),
    name: name.trim(),
    color,
    sortOrder: await db.tagGroups.count(),
    createdAt: now,
    updatedAt: now,
  }
  await db.tagGroups.add(group)
  return group
}

export async function renameTagGroup(group: TagGroup, name: string): Promise<void> {
  await db.tagGroups.put({ ...group, name: name.trim(), updatedAt: Date.now() })
}

export async function deleteTagGroup(groupId: string): Promise<void> {
  await db.transaction('rw', db.tagGroups, db.tags, db.photoTags, async () => {
    const tags = await db.tags.where('groupId').equals(groupId).toArray()
    for (const tag of tags) {
      await db.photoTags.where('tagId').equals(tag.id).delete()
    }
    await db.tags.where('groupId').equals(groupId).delete()
    await db.tagGroups.delete(groupId)
  })
}

export async function createTag(groupId: string, name: string): Promise<Tag> {
  const now = Date.now()
  const tag: Tag = {
    id: createId('tag'),
    groupId,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  }
  await db.tags.add(tag)
  return tag
}

export async function renameTag(tag: Tag, name: string): Promise<void> {
  await db.tags.put({ ...tag, name: name.trim(), updatedAt: Date.now() })
}

export async function deleteTag(tagId: string): Promise<void> {
  await db.transaction('rw', db.tags, db.photoTags, async () => {
    await db.tags.delete(tagId)
    await db.photoTags.where('tagId').equals(tagId).delete()
  })
}

export function getPhotoUrl(filePath: string): string {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.convertFileSrc(filePath)
  }
  return filePath
}
