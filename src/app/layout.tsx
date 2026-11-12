import type { Metadata, Viewport } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { AppProvider } from "@/components/app-provider";
import { appConfig } from "@/lib/config";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
  applicationName: appConfig.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: appConfig.logoUrl,
    apple: appConfig.logoUrl,
  },
  appleWebApp: {
    capable: true,
    title: appConfig.name,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: appConfig.headerColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark" className={`dark-theme ${geist.variable} ${sourceSerif.variable}`}>
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
