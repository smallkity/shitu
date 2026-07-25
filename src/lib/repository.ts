import { db, createId } from "./db";
import { readImageDimensions } from "./photoMetadata";
import type {
  ImportResult,
  PhotoRecord,
  PhotoTag,
  Tag,
  TagGroup,
} from "../types";

export async function importPhotoFiles(files: File[]): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, failed: [] };
  const now = Date.now();

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      result.failed.push({
        fileName: file.name,
        reason: "不是可识别的图片格式",
      });
      continue;
    }

    const existing = await db.photos
      .where("[fileName+size+lastModified]")
      .equals([file.name, file.size, file.lastModified])
      .first();

    if (existing) {
      result.skipped += 1;
      continue;
    }

    try {
      const { width, height } = await readImageDimensions(file);
      const photo: PhotoRecord = {
        id: createId("photo"),
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        blob: file,
        importedAt: now,
        lastModified: file.lastModified,
      };

      await db.photos.add(photo);
      result.imported += 1;
    } catch {
      result.failed.push({
        fileName: file.name,
        reason: "图片无法读取或格式不受支持",
      });
    }
  }

  return result;
}

export async function deletePhoto(photoId: string): Promise<void> {
  await db.transaction("rw", db.photos, db.photoTags, async () => {
    await db.photos.delete(photoId);
    await db.photoTags.where("photoId").equals(photoId).delete();
  });
}

export async function setPhotoTags(
  photoId: string,
  tagIds: string[]
): Promise<void> {
  const uniqueTagIds = [...new Set(tagIds)];
  await db.transaction("rw", db.photoTags, async () => {
    await db.photoTags.where("photoId").equals(photoId).delete();
    if (uniqueTagIds.length > 0) {
      await db.photoTags.bulkAdd(
        uniqueTagIds.map(
          (tagId): PhotoTag => ({
            photoId,
            tagId,
            createdAt: Date.now(),
          })
        )
      );
    }
  });
}

export async function createTagGroup(
  name: string,
  color: string
): Promise<TagGroup> {
  const now = Date.now();
  const group: TagGroup = {
    id: createId("group"),
    name: name.trim(),
    color,
    sortOrder: await db.tagGroups.count(),
    createdAt: now,
    updatedAt: now,
  };
  await db.tagGroups.add(group);
  return group;
}

export async function renameTagGroup(
  group: TagGroup,
  name: string
): Promise<void> {
  await db.tagGroups.put({
    ...group,
    name: name.trim(),
    updatedAt: Date.now(),
  });
}

export async function deleteTagGroup(groupId: string): Promise<void> {
  await db.transaction("rw", db.tagGroups, db.tags, db.photoTags, async () => {
    const tags = await db.tags.where("groupId").equals(groupId).toArray();
    for (const tag of tags) {
      await db.photoTags.where("tagId").equals(tag.id).delete();
    }
    await db.tags.where("groupId").equals(groupId).delete();
    await db.tagGroups.delete(groupId);
  });
}

export async function createTag(groupId: string, name: string): Promise<Tag> {
  const now = Date.now();
  const tag: Tag = {
    id: createId("tag"),
    groupId,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.tags.add(tag);
  return tag;
}

export async function renameTag(tag: Tag, name: string): Promise<void> {
  await db.tags.put({ ...tag, name: name.trim(), updatedAt: Date.now() });
}

export async function deleteTag(tagId: string): Promise<void> {
  await db.transaction("rw", db.tags, db.photoTags, async () => {
    await db.tags.delete(tagId);
    await db.photoTags.where("tagId").equals(tagId).delete();
  });
}
