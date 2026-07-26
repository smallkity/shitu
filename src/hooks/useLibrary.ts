import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { ensureSeedData } from "../lib/seed";
import type { LibrarySnapshot } from "../types";

const EMPTY_SNAPSHOT: LibrarySnapshot = {
  photos: [],
  tagGroups: [],
  tags: [],
  photoTags: [],
};

export function useLibrary(): LibrarySnapshot & { loading: boolean } {
  const snapshot = useLiveQuery(async () => {
    // 1. 先尝试初始化标签，失败不阻止读取照片
    try {
      await ensureSeedData();
    } catch (e) {
      console.warn("[拾图] 初始化标签失败（不影响照片读取）:", e);
    }

    // 2. 分别读取每张表，任何一张失败不影响其他
    let photos: any[] = [];
    let tagGroups: any[] = [];
    let tags: any[] = [];
    let photoTags: any[] = [];

    try {
      photos = await db.photos.toArray();
      // 按导入时间倒序
      photos.sort((a, b) => (b.importedAt || 0) - (a.importedAt || 0));
    } catch (e) {
      console.error("[拾图] 读取照片失败:", e);
    }

    try {
      tagGroups = await db.tagGroups.toArray();
      tagGroups.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } catch (e) {
      console.error("[拾图] 读取标签集失败:", e);
    }

    try {
      tags = await db.tags.toArray();
      tags.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } catch (e) {
      console.error("[拾图] 读取标签失败:", e);
    }

    try {
      photoTags = await db.photoTags.toArray();
    } catch (e) {
      console.error("[拾图] 读取照片标签关系失败:", e);
    }

    console.log("[拾图] 数据库读取完成:", {
      photos: photos.length,
      tagGroups: tagGroups.length,
      tags: tags.length,
      photoTags: photoTags.length,
    });

    return { photos, tagGroups, tags, photoTags };
  }, [], EMPTY_SNAPSHOT);

  return { ...snapshot, loading: snapshot === undefined };
}
