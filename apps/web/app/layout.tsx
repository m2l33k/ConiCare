import type { Metadata } from "next";
import { Inter, Cairo, Fredoka, Tajawal } from "next/font/google";
import "./globals.css";

// Clinical Fonts
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const cairo = Cairo({ 
  subsets: ["arabic"], 
  variable: "--font-cairo",
  display: 'swap',
});

// Play Fonts
const fredoka = Fredoka({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: 'swap',
});

const tajawal = Tajawal({ 
  subsets: ["arabic"], 
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MindBloom",
  description: "Cognitive Health Monitoring Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cairo.variable} ${fredoka.variable} ${tajawal.variable} min-h-screen bg-slate-50 font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
