import type { Metadata } from "next";
import { Cinzel_Decorative, Crimson_Pro, IM_Fell_English, Geist } from "next/font/google";
import SiteNav from '@/components/SiteNav'
import "./globals.css";

// Ornate display font for titles (like Lovable)
const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

// Clean serif for body text
const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Manuscript/italic style for quotes and subtitles
const imFellEnglish = IM_Fell_English({
  variable: "--font-manuscript",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Átrias Wiki",
  description: "A wiki for the world of Átrias - an original D&D campaign setting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cinzelDecorative.variable} ${crimsonPro.variable} ${imFellEnglish.variable} ${geist.variable} antialiased bg-zinc-900`}
      >
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
