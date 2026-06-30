import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "MeshySmith 3D editor",
  description: "Browser-based MeshySmith editor workspace",
  applicationName: "MeshySmith",
  // icons resolved automatically from app/icon.png + app/apple-icon.png + public/favicon.ico
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
