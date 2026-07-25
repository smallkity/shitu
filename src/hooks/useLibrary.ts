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
  const snapshot = useLiveQuery(
    async () => {
      try {
        await ensureSeedData();
        const [photos, tagGroups, tags, photoTags] = await Promise.all([
          db.photos.orderBy("importedAt").reverse().toArray(),
          db.tagGroups.orderBy("sortOrder").toArray(),
          db.tags.orderBy("createdAt").toArray(),
          db.photoTags.toArray(),
        ]);
        return { photos, tagGroups, tags, photoTags };
      } catch (error) {
        console.error("[拾图] 读取数据库失败:", error);
        return EMPTY_SNAPSHOT;
      }
    },
    [],
    EMPTY_SNAPSHOT
  );

  return { ...snapshot, loading: snapshot === undefined };
}
