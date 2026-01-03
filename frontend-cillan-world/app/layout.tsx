import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import I18nProvider from "./i18nProvider"; // <- este componente debe tener "use client"
import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cillan.world";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cillan World",
    template: "%s | Cillan World",
  },
  description: "Welcome to Cillan World!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Cillan World",
    description: "Welcome to Cillan World!",
    siteName: "Cillan World",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cillan World",
    description: "Welcome to Cillan World!",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: { children: React.ReactNode }) {
  const cookieStore = await cookies(); // <- ahora sí, await
  const lng = (cookieStore.get("NEXT_LOCALE")?.value ?? "es") as "es" | "en";

  return (
    <html lang={lng}>
      <body className="normal">
        <I18nProvider lang={lng}>
          {children}
          <Toaster position="top-right" />
        </I18nProvider>
      </body>
    </html>
  );
}
