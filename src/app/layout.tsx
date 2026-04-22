import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Task List",
  description: "Personal goals, tasks, and daily reflections.",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Task List",
  },
  icons: {
    icon: `${basePath}/icon.svg`,
    apple: `${basePath}/icon-192.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:pt-10">
          <header className="mb-8">
            <Nav />
          </header>
          <main className="fade-in">{children}</main>
        </div>
      </body>
    </html>
  );
}
