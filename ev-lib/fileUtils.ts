// src/ev-lib/fileUtils.ts
export const getFilePreview = (
  file: File | string | null,
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    if (typeof file === "string") {
      if (file.startsWith("<?xml") || file.startsWith("<svg")) {
        // Keep only the SVG part, remove prolog if present
        const cleaned = file.replace(/<\?xml[\s\S]*?\?>/, "").trim();
        const encoded = encodeURIComponent(cleaned);
        resolve(`data:image/svg+xml;charset=utf-8,${encoded}`);
      } else {
        resolve(file); // already a URL or valid base64 string
      }
      return;
    }

    // Handle actual File objects
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const revokeObjectUrl = (url: string | null) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};
