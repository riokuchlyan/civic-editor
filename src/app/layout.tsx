import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Civic Text Editor",
  description: "AI-powered text editor with collaboration features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="minimal-nav">
          <div className="minimal-nav-content">
            <Link href="/" className="minimal-nav-logo">
              Civic Editor
            </Link>
            <div className="minimal-nav-links">
              <a href="/happy" className="minimal-nav-link">
                Happy
              </a>
              <a href="/sad" className="minimal-nav-link">
                Sad
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
