import "@/ev-lib/localStorage-polyfill";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { UserContextProvider } from "@/ev-contexts/userContextProvider";
import { Toaster } from "react-hot-toast";
import "@/components/carousel/embla.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Electro Vision",
  description: "Electro Vision",
};

// Inline script must run before any other script so localStorage is fixed
// when Tauri WebView exposes a broken localStorage (e.g. --localstorage-file without valid path)
const localStoragePolyfill = `
(function() {
  if (typeof window === 'undefined') return;
  try {
    if (typeof localStorage.getItem !== 'function') {
      var storage = {};
      window.localStorage = {
        getItem: function(k) { return storage[k] != null ? String(storage[k]) : null; },
        setItem: function(k, v) { storage[k] = String(v); },
        removeItem: function(k) { delete storage[k]; },
        clear: function() { storage = {}; },
        key: function(i) { return Object.keys(storage)[i] || null; },
        get length() { return Object.keys(storage).length; }
      };
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: localStoragePolyfill }} />
        <UserContextProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #334155",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#F6AA1C", secondary: "#1e293b" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#1e293b" },
              },
            }}
          />
        </UserContextProvider>
      </body>
    </html>
  );
}
