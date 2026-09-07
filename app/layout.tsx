import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soft Life Era",
  description: "How do you want today to feel?",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
