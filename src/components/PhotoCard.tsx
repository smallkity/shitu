import { Edit3, Maximize2, MoreHorizontal, Trash2 } from "./Icons";
import { PhotoImage } from "./PhotoImage";
import { formatDate } from "../lib/photoMetadata";
import type { PhotoRecord, Tag } from "../types";

interface PhotoCardProps {
  photo: PhotoRecord;
  tags: Tag[];
  onOpen: () => void;
  onViewer: () => void;
  onDelete: () => void;
}

export function PhotoCard({ photo, tags, onOpen, onViewer, onDelete }: PhotoCardProps) {
  return (
    <article className="photo-card">
      <button
        className="photo-card-image"
        onClick={onViewer}
        aria-label={`大图查看 ${photo.fileName}`}
      >
        <PhotoImage
          filePath={photo.filePath}
          alt={photo.fileName}
          className="photo-card-image__img"
        />
        <span className="photo-card-menu" aria-hidden="true">
          <MoreHorizontal size={18} />
        </span>
        {tags.length > 0 && (
          <span className="photo-card-tag-count">{tags.length} 个标签</span>
        )}
      </button>
      <div className="photo-card-content">
        <div className="photo-card-title-row">
          <div>
            <h3 title={photo.fileName}>{photo.fileName}</h3>
            <p>{formatDate(photo.capturedAt ?? photo.lastModified)}</p>
          </div>
          <button
            className="icon-button subtle"
            onClick={onOpen}
            aria-label="编辑标签"
          >
            <Edit3 size={16} />
          </button>
          <button
            className="icon-button subtle"
            onClick={onViewer}
            aria-label="大图浏览"
            title="大图浏览"
          >
            <Maximize2 size={15} />
          </button>
        </div>
        <div className="photo-card-tags">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag.id} className="mini-tag">
              {tag.name}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="mini-tag more">+{tags.length - 3}</span>
          )}
        </div>
        <button className="photo-delete" onClick={onDelete}>
          <Trash2 size={14} />
          移除
        </button>
      </div>
    </article>
  );
}
