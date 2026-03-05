// ev-lib/pdfUtils.ts — client-only, never imported from server components
// Dynamically loads pdfjs-dist to avoid SSR issues.

type PdfjsLib = typeof import("pdfjs-dist");

let _pdfjs: PdfjsLib | null = null;

async function getLib(): Promise<PdfjsLib> {
  if (_pdfjs) return _pdfjs;
  _pdfjs = await import("pdfjs-dist");
  // Worker lives in /public so it's available under Tauri's webview too
  _pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return _pdfjs;
}

/** Turn a File or a (blob/http) URL into a loading-task source object. */
async function toSource(
  source: File | string,
): Promise<{ data: ArrayBuffer } | { url: string }> {
  if (source instanceof File) {
    return { data: await source.arrayBuffer() };
  }
  return { url: source };
}

/**
 * Returns the total number of pages in a PDF.
 */
export async function getPdfPageCount(source: File | string): Promise<number> {
  const lib = await getLib();
  const task = lib.getDocument(await toSource(source));
  const pdf = await task.promise;
  const count = pdf.numPages;
  await pdf.destroy();
  return count;
}

/**
 * Renders one page of a PDF into the supplied canvas element.
 * The canvas is resized to match the rendered viewport.
 */
export async function renderPdfPageToCanvas(
  source: File | string,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale = 1.5,
): Promise<void> {
  const lib = await getLib();
  const task = lib.getDocument(await toSource(source));
  const pdf = await task.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get 2D context from canvas");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvas, viewport }).promise;
  page.cleanup();
  await pdf.destroy();
}

/**
 * Renders a single PDF page and returns it as a PNG data URL.
 * Use `scale = 2.0` for a high-quality export suitable as a map background.
 */
export async function pdfPageToDataUrl(
  source: File | string,
  pageNumber: number,
  scale = 2.0,
): Promise<string> {
  const canvas = document.createElement("canvas");
  await renderPdfPageToCanvas(source, pageNumber, canvas, scale);
  return canvas.toDataURL("image/png");
}
