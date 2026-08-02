"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

export default function UploadReport({ masterName }: { masterName: string }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setFileName(file.name);
    // TODO: POST to /api/masters/:id/reports — backend detects
    // statement_html vs deals_csv from extension/content and parses accordingly.
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
        dragging ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,.csv,.xlsx,.xlsm"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <UploadCloud size={22} className="text-gold" strokeWidth={1.75} />
      <p className="mt-3 text-sm text-text">
        {fileName ? (
          <span className="font-mono text-text">{fileName}</span>
        ) : (
          <>Tarik file report ke sini, atau klik untuk pilih</>
        )}
      </p>
      <p className="mt-1 text-xs text-text-dim">
        Upload report untuk <span className="text-text-dim/90">{masterName}</span>
      </p>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-text-dim">
        <span className="flex items-center gap-1.5">
          <FileSpreadsheet size={13} strokeWidth={1.75} /> Trade History (.xlsx)
        </span>
        <span className="flex items-center gap-1.5">
          <FileSpreadsheet size={13} strokeWidth={1.75} /> Statement HTML / CSV
        </span>
      </div>
    </div>
  );
}
