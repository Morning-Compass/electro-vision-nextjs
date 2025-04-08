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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        <UserContextProvider>
          {children}
          <Toaster position="top-center" />
        </UserContextProvider>
      </body>
    </html>
  );
}
