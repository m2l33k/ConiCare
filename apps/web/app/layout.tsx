import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindBloom Specialist Dashboard",
  description: "Cognitive Health Monitoring Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
