import { db, createId } from "./db";

const DEFAULT_GROUPS = [
  {
    name: "场景",
    color: "#d68b5d",
    tags: ["高山", "蓝天", "草地", "白云"],
  },
  {
    name: "氛围",
    color: "#7b8fb2",
    tags: ["暖色", "童话", "蓝调", "安静"],
  },
  {
    name: "人物",
    color: "#c98593",
    tags: ["家人", "朋友", "独处"],
  },
];

export async function ensureSeedData(): Promise<void> {
  const seeded = await db.settings.get("default-tags-seeded");
  if (seeded) return;

  const now = Date.now();
  await db.transaction("rw", db.tagGroups, db.tags, db.settings, async () => {
    const alreadySeeded = await db.settings.get("default-tags-seeded");
    if (alreadySeeded) return;
    for (const [index, group] of DEFAULT_GROUPS.entries()) {
      const groupId = createId("group");
      await db.tagGroups.add({
        id: groupId,
        name: group.name,
        color: group.color,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      });

      await db.tags.bulkAdd(
        group.tags.map((name) => ({
          id: createId("tag"),
          groupId,
          name,
          createdAt: now,
          updatedAt: now,
        }))
      );
    }

    await db.settings.put({ key: "default-tags-seeded", value: "true" });
  });
}
