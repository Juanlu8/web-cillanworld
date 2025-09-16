import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import I18nProvider from "./i18nProvider"; // <- este componente debe tener "use client"
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Cillan World",
  description: "Welcome to Cillan`s World!",
};

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