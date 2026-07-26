import { useRef, useState } from "react";
import { ImagePlus } from "./Icons";
import { importPhotoFiles } from "../lib/repository";

interface ImportButtonProps {
  onImported: (message: string) => void;
}

export function ImportButton({ onImported }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      onImported("没有选择任何文件");
      return;
    }
    event.target.value = "";

    setImporting(true);
    try {
      const result = await importPhotoFiles(files);
      const parts: string[] = [];
      if (result.imported > 0) parts.push(`已导入 ${result.imported} 张`);
      if (result.skipped > 0) parts.push(`跳过 ${result.skipped} 张重复`);
      if (result.failed.length > 0)
        parts.push(`${result.failed.length} 张失败`);
      onImported(
        parts.length > 0 ? parts.join("，") : "导入完成，但没有照片被添加"
      );
    } catch (error) {
      console.error("[拾图] 导入异常:", error);
      onImported("导入失败，请重试");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
      <button
        className="primary-button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
      >
        <ImagePlus size={18} />
        {importing ? "正在导入…" : "导入照片"}
      </button>
    </>
  );
}
