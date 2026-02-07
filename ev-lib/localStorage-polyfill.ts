/**
 * Stub localStorage for Node/SSR when it's missing or broken (e.g. Tauri dev
 * with --localstorage-file without path). Import this first in root layout so
 * it runs before any dependency (e.g. react-hot-toast) touches localStorage.
 */
const g =
  typeof globalThis !== "undefined"
    ? (globalThis as typeof globalThis & { localStorage?: Storage })
    : null;

if (g && typeof g.localStorage?.getItem !== "function") {
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
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
    key: (i: number) => Object.keys(storage)[i] ?? null,
    get length() {
      return Object.keys(storage).length;
    },
  };
}
