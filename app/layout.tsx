import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { UserContextProvider } from "@/ev-contexts/userContextProvider";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: "400" });

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
      <body className={poppins.className}>
        <UserContextProvider>
          {children}
          <Toaster position="top-center" />
        </UserContextProvider>
      </body>
    </html>
  );
}
