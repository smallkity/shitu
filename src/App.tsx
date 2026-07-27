import { useMemo, useState } from "react";
import {
  Filter,
  Images,
  LayoutGrid,
  Maximize2,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Tags,
  X,
} from "./components/Icons";
import { FilterPanel } from "./components/FilterPanel";
import { ImportButton } from "./components/ImportButton";
import { PhotoCard } from "./components/PhotoCard";
import { PhotoDetailDrawer } from "./components/PhotoDetailDrawer";
import { PhotoViewer } from "./components/PhotoViewer";
import { InstallAppButton } from "./components/InstallAppButton";
import { TagManager } from "./components/TagManager";
import { useLibrary } from "./hooks/useLibrary";
import { deletePhoto } from "./lib/repository";
import { filterPhotos } from "./lib/filterPhotos";
import type { PhotoRecord, TagSelection } from "./types";

function App() {
  const { photos, tagGroups, tags, photoTags, loading } = useLibrary();
  const [activeView, setActiveView] = useState<"library" | "tags">("library");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<TagSelection>({});
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [toast, setToast] = useState<string>();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const visiblePhotos = useMemo(
    () => filterPhotos(photos, photoTags, tags, tagGroups, search, selection),
    [photos, photoTags, tags, tagGroups, search, selection]
  );

  const photoTagsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const relation of photoTags) {
      map.set(relation.photoId, [
        ...(map.get(relation.photoId) ?? []),
        relation.tagId,
      ]);
    }
    return map;
  }, [photoTags]);

  const tagPhotoCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const relation of photoTags)
      counts.set(relation.tagId, (counts.get(relation.tagId) ?? 0) + 1);
    return counts;
  }, [photoTags]);

  const activeFilterCount = Object.values(selection).reduce(
    (count, ids) => count + ids.length,
    0
  );

  function toggleTag(groupId: string, tagId: string) {
    setSelection((current) => {
      const currentGroup = current[groupId] ?? [];
      const nextGroup = currentGroup.includes(tagId)
        ? currentGroup.filter((id) => id !== tagId)
        : [...currentGroup, tagId];
      return { ...current, [groupId]: nextGroup };
    });
  }

  function clearFilters() {
    setSelection({});
    setSearch("");
  }

  async function handleDelete(photo: PhotoRecord) {
    if (
      !window.confirm(
        `确定从拾图中移除“${photo.fileName}”吗？原文件不会被删除。`
      )
    )
      return;
    await deletePhoto(photo.id);
    setSelectedPhoto(null);
    showToast("照片已从图库移除，原文件保持不变");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(undefined), 3200);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="brand-name">拾图</span>
            <span className="brand-subtitle">PHOTO LIBRARY</span>
          </div>
        </div>
        <nav className="top-nav" aria-label="主导航">
          <button
            className={
              activeView === "library" ? "nav-item active" : "nav-item"
            }
            onClick={() => setActiveView("library")}
          >
            <Images size={17} />
            我的图库
          </button>
          <button
            className={activeView === "tags" ? "nav-item active" : "nav-item"}
            onClick={() => setActiveView("tags")}
          >
            <Tags size={17} />
            标签管理
          </button>
        </nav>
        <div className="topbar-actions">
          <InstallAppButton />
          <button className="icon-button" aria-label="设置">
            <Settings2 size={18} />
          </button>
          <div className="avatar">拾</div>
        </div>
      </header>

      {activeView === "tags" ? (
        <main className="page-container tag-page">
          <div className="page-heading compact-heading">
            <div>
              <p className="eyebrow">ORGANIZE YOUR MEMORIES</p>
              <h1>标签词典</h1>
              <p className="page-description">
                把你看见的、感受到的，变成照片的另一种记忆。
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setActiveView("library")}
            >
              <Images size={16} />
              返回图库
            </button>
          </div>
          <TagManager
            groups={tagGroups}
            tags={tags}
            photoTagCounts={tagPhotoCounts}
            onClose={() => setActiveView("library")}
          />
        </main>
      ) : (
        <main className="page-container">
          <section className="hero-section">
            <div className="hero-copy">
              <p className="eyebrow">A QUIET PLACE FOR YOUR MEMORIES</p>
              <h1>
                每一张照片，<em>都有它的故事。</em>
              </h1>
              <p className="page-description">
                用你自己的语言整理生活。为照片贴上标签，下一次想起它时，能更快找到。
              </p>
            </div>
            <div className="hero-actions">
              <ImportButton
                onImported={(r) =>
                  showToast(
                    `成功导入 ${r.imported} 张照片${
                      r.skipped > 0 ? `，跳过 ${r.skipped} 张已存在` : ""
                    }`
                  )
                }
              />
              <button
                className="manage-tags-button"
                onClick={() => setActiveView("tags")}
              >
                <Tags size={16} />
                管理标签
              </button>
            </div>
          </section>

          <section className="workspace">
            <div className="workspace-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜索文件名…"
                />
                <kbd>⌘ K</kbd>
                {search && (
                  <button
                    className="search-clear"
                    onClick={() => setSearch("")}
                    aria-label="清除搜索"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                className="mobile-filter-trigger"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={17} />
                筛选{activeFilterCount > 0 && <b>{activeFilterCount}</b>}
              </button>
              <div className="view-tools">
                <span className="result-count">
                  {loading
                    ? "读取中…"
                    : `${visiblePhotos.length} / ${photos.length} 张照片`}
                </span>
                <button
                  className="view-button"
                  aria-label="大图浏览"
                  onClick={() => visiblePhotos.length > 0 && setViewerIndex(0)}
                  disabled={visiblePhotos.length === 0}
                  title="大图浏览筛选结果"
                >
                  <Maximize2 size={17} />
                </button>
                <button className="view-button active" aria-label="网格视图">
                  <LayoutGrid size={17} />
                </button>
              </div>
            </div>
            <div className="workspace-layout">
              <FilterPanel
                groups={tagGroups}
                tags={tags}
                selection={selection}
                onToggle={toggleTag}
                onClear={clearFilters}
              />
              <section className="gallery-area" aria-label="照片网格">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-orb" />
                    <p>正在打开你的记忆库…</p>
                  </div>
                ) : visiblePhotos.length === 0 ? (
                  <EmptyState
                    hasPhotos={photos.length > 0}
                    hasFilters={activeFilterCount > 0 || Boolean(search)}
                    onClear={clearFilters}
                  />
                ) : (
                  <div className="photo-grid">
                    {visiblePhotos.map((photo, index) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        tags={tags.filter((tag) =>
                          photoTagsMap.get(photo.id)?.includes(tag.id)
                        )}
                        onOpen={() => setSelectedPhoto(photo)}
                        onViewer={() => setViewerIndex(index)}
                        onDelete={() => handleDelete(photo)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </section>
        </main>
      )}

      {mobileFiltersOpen && (
        <div className="mobile-filter-sheet">
          <div className="mobile-sheet-header">
            <h2>筛选照片</h2>
            <button
              className="icon-button"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="关闭筛选"
            >
              <X size={20} />
            </button>
          </div>
          <FilterPanel
            groups={tagGroups}
            tags={tags}
            selection={selection}
            onToggle={toggleTag}
            onClear={clearFilters}
          />
          <button
            className="save-button"
            onClick={() => setMobileFiltersOpen(false)}
          >
            查看结果 · {visiblePhotos.length} 张
          </button>
        </div>
      )}
      <PhotoDetailDrawer
        photo={selectedPhoto}
        groups={tagGroups}
        tags={tags}
        photoTags={photoTags}
        onClose={() => setSelectedPhoto(null)}
        onDelete={() => selectedPhoto && handleDelete(selectedPhoto)}
      />
      {viewerIndex !== null && visiblePhotos.length > 0 && (
        <PhotoViewer
          photos={visiblePhotos}
          startIndex={Math.min(viewerIndex, visiblePhotos.length - 1)}
          onClose={() => setViewerIndex(null)}
        />
      )}
      {toast && (
        <div className="toast">
          <span className="toast-dot" />
          {toast}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  hasPhotos,
  hasFilters,
  onClear,
}: {
  hasPhotos: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {hasFilters ? <Filter size={25} /> : <Images size={25} />}
      </div>
      <h2>
        {hasPhotos && hasFilters ? "没有找到匹配的照片" : "你的图库还是空的"}
      </h2>
      <p>
        {hasPhotos && hasFilters
          ? "试试换一组标签，或者减少一些筛选条件。"
          : "从手机里导入第一张照片，开始建立你的私人记忆库。"}
      </p>
      {hasFilters && (
        <button className="secondary-button" onClick={onClear}>
          清除所有筛选
        </button>
      )}
    </div>
  );
}

export default App;
