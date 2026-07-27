import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause, Shuffle, Repeat } from "./Icons";
import { PhotoImage } from "./PhotoImage";
import type { PhotoRecord } from "../types";

type PlayMode = "off" | "sequential" | "random";

interface PhotoViewerProps {
  photos: PhotoRecord[];
  startIndex: number;
  onClose: () => void;
}

const AUTOPLAY_INTERVAL = 3500;

export function PhotoViewer({ photos, startIndex, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [playMode, setPlayMode] = useState<PlayMode>("off");
  const [showControls, setShowControls] = useState(true);
  const [playedIndices, setPlayedIndices] = useState<number[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (photos.length === 0) return;
      const next = ((index % photos.length) + photos.length) % photos.length;
      setCurrentIndex(next);
    },
    [photos.length]
  );

  const goNext = useCallback(() => {
    if (playMode === "random" && photos.length > 1) {
      let randomIndex = currentIndex;
      const available = photos
        .map((_, i) => i)
        .filter((i) => i !== currentIndex && !playedIndices.includes(i));
      if (available.length === 0) {
        // 所有图片都播放过了，重新开始
        setPlayedIndices([currentIndex]);
        const candidates = photos.map((_, i) => i).filter((i) => i !== currentIndex);
        randomIndex = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        randomIndex = available[Math.floor(Math.random() * available.length)];
        setPlayedIndices((prev) => [...prev, currentIndex]);
      }
      goTo(randomIndex);
    } else {
      goTo(currentIndex + 1);
    }
  }, [currentIndex, goTo, photos.length, playMode, playedIndices]);

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Auto-play
  useEffect(() => {
    if (playMode === "off") return;
    const timer = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [playMode, goNext]);

  // Reset played indices when entering random mode
  useEffect(() => {
    if (playMode === "random") {
      setPlayedIndices([startIndex]);
    }
  }, [playMode, startIndex]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose();
      else if (e.key === " ") {
        e.preventDefault();
        setPlayMode((prev) => (prev === "off" ? "sequential" : "off"));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onClose]);

  // Auto-hide controls
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playMode !== "off") setShowControls(false);
    }, 3000);
  }, [playMode]);

  useEffect(() => {
    showControlsTemporarily();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, [showControlsTemporarily, currentIndex]);

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  function cyclePlayMode() {
    setPlayMode((prev) => {
      if (prev === "off") return "sequential";
      if (prev === "sequential") return "random";
      return "off";
    });
  }

  const photo = photos[currentIndex];
  if (!photo) return null;

  const playLabel =
    playMode === "off" ? "自动播放" : playMode === "sequential" ? "顺序播放中" : "随机播放中";

  return (
    <div
      className="photo-viewer"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={showControlsTemporarily}
    >
      <div className="photo-viewer__image-container">
        <PhotoImage
          filePath={photo.filePath}
          alt={photo.fileName}
          className="photo-viewer__img"
        />
      </div>

      {photos.length > 1 && (
        <>
          <button
            className="photo-viewer__nav photo-viewer__nav--left"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="上一张"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            className="photo-viewer__nav photo-viewer__nav--right"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="下一张"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div
        className={`photo-viewer__controls ${showControls ? "" : "hidden"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="photo-viewer__close"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={22} />
        </button>

        <div className="photo-viewer__info">
          <span className="photo-viewer__counter">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="photo-viewer__filename" title={photo.fileName}>
            {photo.fileName}
          </span>
        </div>

        <div className="photo-viewer__toolbar">
          <button
            className={`photo-viewer__btn ${playMode === "off" ? "" : "active"}`}
            onClick={cyclePlayMode}
            aria-label={playLabel}
          >
            {playMode === "off" ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button
            className={`photo-viewer__btn ${playMode === "random" ? "active" : ""}`}
            onClick={() => setPlayMode((prev) => (prev === "random" ? "off" : "random"))}
            aria-label="随机播放"
          >
            <Shuffle size={18} />
          </button>
          <button
            className={`photo-viewer__btn ${playMode === "sequential" ? "active" : ""}`}
            onClick={() => setPlayMode((prev) => (prev === "sequential" ? "off" : "sequential"))}
            aria-label="顺序播放"
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Progress dots */}
        {photos.length <= 30 && (
          <div className="photo-viewer__dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`photo-viewer__dot ${i === currentIndex ? "active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`第 ${i + 1} 张`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
