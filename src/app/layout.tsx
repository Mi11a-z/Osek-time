import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Osek Time — обсуждают в Казахстане",
  description: "Городские истории, любимые места и разговоры о жизни в Казахстане.",
  icons: { icon: "/osek-icon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
