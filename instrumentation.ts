/**
 * Stub localStorage for the Node/SSR environment when it's missing or broken.
 * Tauri dev can inject a broken localStorage (--localstorage-file without path),
 * causing "localStorage.getItem is not a function" during server-side rendering.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const g = globalThis as typeof globalThis & {
      localStorage?: Storage | { getItem: (k: string) => string | null };
    };
    if (!g.localStorage || typeof g.localStorage.getItem !== "function") {
      const storage: Record<string, string> = {};
      g.localStorage = {
        getItem: (k: string) => storage[k] ?? null,
        setItem: (k: string, v: string) => {
          storage[k] = v;
        },
        removeItem: (k: string) => {
          delete storage[k];
        },
        clear: () => {
          Object.keys(storage).forEach((k) => delete storage[k]);
        },
        key: (i: number) => Object.keys(storage)[i] ?? null,
        get length() {
          return Object.keys(storage).length;
        },
      };
    }
  }
}
