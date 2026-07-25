import { useEffect, useMemo, useState } from "react";
import { Check, Trash2, X } from "./Icons";
import { PhotoImage } from "./PhotoImage";
import { formatDate, formatFileSize } from "../lib/photoMetadata";
import { setPhotoTags } from "../lib/repository";
import type { PhotoRecord, Tag, TagGroup, PhotoTag } from "../types";

interface PhotoDetailDrawerProps {
  photo: PhotoRecord | null;
  groups: TagGroup[];
  tags: Tag[];
  photoTags: PhotoTag[];
  onClose: () => void;
  onDelete: () => void;
}

export function PhotoDetailDrawer({
  photo,
  groups,
  tags,
  photoTags,
  onClose,
  onDelete,
}: PhotoDetailDrawerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!photo) return;
    setSelected(
      photoTags
        .filter((relation) => relation.photoId === photo.id)
        .map((relation) => relation.tagId)
    );
  }, [photo, photoTags]);

  const selectedTags = useMemo(
    () => tags.filter((tag) => selected.includes(tag.id)),
    [selected, tags]
  );

  if (!photo) return null;

  function toggleTag(tagId: string) {
    setSelected((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId]
    );
  }

  async function save() {
    if (!photo) return;
    const photoId = photo.id;
    setSaving(true);
    try {
      await setPhotoTags(photoId, selected);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="照片详情"
      >
        <button
          className="drawer-close icon-button"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={20} />
        </button>
        <div className="detail-preview">
          <PhotoImage photo={photo} />
        </div>
        <div className="detail-body">
          <div className="detail-title-row">
            <div>
              <p className="eyebrow">PHOTO DETAILS</p>
              <h2 title={photo.fileName}>{photo.fileName}</h2>
            </div>
            <button
              className="icon-button danger"
              onClick={onDelete}
              aria-label="删除照片"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="photo-metadata">
            <span>
              {photo.width} × {photo.height}
            </span>
            <span>{formatFileSize(photo.size)}</span>
            <span>{formatDate(photo.capturedAt ?? photo.lastModified)}</span>
          </div>

          <div className="selected-tags-preview">
            <span className="field-label">已添加标签</span>
            <div className="tag-chip-list">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <span className="tag-chip" key={tag.id}>
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="muted">还没有标签，开始为它建立记忆吧</span>
              )}
            </div>
          </div>

          <div className="tag-picker">
            <span className="field-label">选择标签</span>
            {groups.map((group) => (
              <div className="picker-group" key={group.id}>
                <div className="picker-group-name">
                  <span
                    className="group-dot"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </div>
                <div className="picker-options">
                  {tags
                    .filter((tag) => tag.groupId === group.id)
                    .map((tag) => {
                      const isSelected = selected.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          className={`picker-tag ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => toggleTag(tag.id)}
                        >
                          <span>{tag.name}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <button className="save-button" onClick={save} disabled={saving}>
            {saving ? "保存中…" : "保存标签"}
          </button>
        </div>
      </section>
    </div>
  );
}
