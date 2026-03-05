"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Check,
  Loader2,
  FileText,
} from "lucide-react";

interface PdfPreviewOverlayProps {
  /** File object (local) or a blob/http URL (remote). */
  source: File | string | null;
  isOpen: boolean;
  onClose: () => void;
  /**
   * When provided, shows a "Use this page" button. Called with the
   * selected page rendered as a high-quality PNG data URL.
   */
  onSelectPage?: (dataUrl: string, pageNumber: number) => void;
  title?: string;
}

export default function PdfPreviewOverlay({
  source,
  isOpen,
  onClose,
  onSelectPage,
  title,
}: PdfPreviewOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when source or open state changes
  useEffect(() => {
    if (!isOpen || !source) {
      setPageCount(0);
      setCurrentPage(1);
      setError(null);
      return;
    }
    setCountLoading(true);
    setError(null);
    import("@/ev-lib/pdfUtils")
      .then(({ getPdfPageCount }) => getPdfPageCount(source))
      .then((count) => {
        setPageCount(count);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("PDF load error:", err);
        setError("Failed to load PDF. The file may be corrupted or unsupported.");
      })
      .finally(() => setCountLoading(false));
  }, [isOpen, source]);

  // Render whenever page, scale, or source changes
  const renderPage = useCallback(async () => {
    if (!source || !canvasRef.current || !isOpen || pageCount === 0) return;
    setLoading(true);
    setError(null);
    try {
      const { renderPdfPageToCanvas } = await import("@/ev-lib/pdfUtils");
      await renderPdfPageToCanvas(source, currentPage, canvasRef.current, scale);
      // Scroll the viewer back to top when changing pages
      scrollRef.current?.scrollTo({ top: 0 });
    } catch (err) {
      console.error("Render error:", err);
      setError("Failed to render this page.");
    } finally {
      setLoading(false);
    }
  }, [source, currentPage, scale, isOpen, pageCount]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handleSelectPage = async () => {
    if (!source || !onSelectPage) return;
    setExtracting(true);
    try {
      const { pdfPageToDataUrl } = await import("@/ev-lib/pdfUtils");
      const dataUrl = await pdfPageToDataUrl(source, currentPage, 2.5);
      onSelectPage(dataUrl, currentPage);
      onClose();
    } catch (err) {
      console.error("Extract error:", err);
    } finally {
      setExtracting(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentPage((p) => Math.max(1, p - 1));
      if (e.key === "ArrowRight")
        setCurrentPage((p) => Math.min(pageCount, p + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, pageCount, onClose]);

  if (!isOpen || !source) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= pageCount;
  const isPending = countLoading || loading;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── Top bar ───────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#0f172a]/90 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F6AA1C]/15 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-[#F6AA1C]" />
          </div>
          <div>
            <p className="text-slate-100 font-semibold text-sm leading-tight">
              {title ?? "PDF Preview"}
            </p>
            {pageCount > 0 && (
              <p className="text-slate-500 text-xs">
                Page {currentPage} of {pageCount}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSelectPage && (
            <button
              onClick={handleSelectPage}
              disabled={extracting || isPending || pageCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6AA1C] text-[#0a0f1e] text-xs font-bold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {extracting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Use this page
            </button>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:border-[#475569] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Canvas area ───────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto flex items-start justify-center p-6 min-h-0"
      >
        {countLoading && (
          <div className="flex flex-col items-center gap-3 mt-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#F6AA1C]" />
            <span className="text-sm">Loading PDF…</span>
          </div>
        )}

        {error && (
          <div className="mt-20 text-center">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {!countLoading && !error && (
          <div className="relative shadow-2xl rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-[#0f172a]/70 flex items-center justify-center z-10">
                <Loader2 className="w-7 h-7 animate-spin text-[#F6AA1C]" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="block max-w-full"
              style={{ background: "#fff" }}
            />
          </div>
        )}
      </div>

      {/* ── Controls bar ──────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-3 bg-[#0f172a]/90 border-t border-[#334155]">
        {/* Zoom */}
        <div className="flex items-center gap-1 bg-[#1e293b] border border-[#334155] rounded-xl px-2 py-1.5">
          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)))}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page navigation */}
        {pageCount > 1 && (
          <div className="flex items-center gap-1 bg-[#1e293b] border border-[#334155] rounded-xl px-2 py-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={isFirstPage || isPending}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
              title="Previous page (←)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-slate-300 w-20 text-center select-none">
              {currentPage} / {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={isLastPage || isPending}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-colors"
              title="Next page (→)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span className="text-xs text-slate-600 select-none">
          ← → to navigate · Esc to close
        </span>
      </div>
    </div>
  );
}
