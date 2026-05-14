import type { Metadata } from "next";
import { Sour_Gummy, Geist_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Sour_Gummy({
  subsets: ["latin"],
  variable: "--font-sour-gummy",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "PochiKaku",
  description: "PochiKaku - A vibrant art community for sharing and discovering creativity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen font-(family-name:--font-sour-gummy)">
        {children}
      </body>
    </html>
  );
}