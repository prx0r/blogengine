import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { AudioProvider } from "@/lib/audio-context";
import GlobalPlayer from "@/components/GlobalPlayer";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "33s",
  description: "Soul mirror, ritual, meditation & practice journal",
  manifest: `${basePath}/manifest.json`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "33s",
    },
  };
  
  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en" className="h-full antialiased">
        <head>
          <link rel="icon" href={`${basePath}/logo.png`} />
          <link rel="apple-touch-icon" href={`${basePath}/logo.png`} />
        </head>
      <body className="min-h-full flex">
        <AudioProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col pt-12 md:pt-0 pb-20">{children}</main>
          <GlobalPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
