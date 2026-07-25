import type { PhotoRecord, PhotoTag, Tag, TagGroup, TagSelection } from '../types'

export function filterPhotos(
  photos: PhotoRecord[],
  photoTags: PhotoTag[],
  tags: Tag[],
  tagGroups: TagGroup[],
  search: string,
  selectedTagsByGroup: TagSelection,
): PhotoRecord[] {
  const normalizedSearch = search.trim().toLocaleLowerCase()
  const tagToGroup = new Map(tags.map((tag) => [tag.id, tag.groupId]))
  const photoToTags = new Map<string, Set<string>>()

  for (const relation of photoTags) {
    const current = photoToTags.get(relation.photoId) ?? new Set<string>()
    current.add(relation.tagId)
    photoToTags.set(relation.photoId, current)
  }

  const activeGroups = tagGroups
    .map((group) => ({ groupId: group.id, tagIds: selectedTagsByGroup[group.id] ?? [] }))
    .filter(({ tagIds }) => tagIds.length > 0)

  return photos.filter((photo) => {
    if (normalizedSearch && !photo.fileName.toLocaleLowerCase().includes(normalizedSearch)) {
      return false
    }

    const photoTagIds = photoToTags.get(photo.id) ?? new Set<string>()

    return activeGroups.every(({ groupId, tagIds }) => {
      return tagIds.some((tagId) => {
        return tagToGroup.get(tagId) === groupId && photoTagIds.has(tagId)
      })
    })
  })
}
