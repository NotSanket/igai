import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IGAI — Impact Intelligence",
    template: "%s | IGAI",
  },
  description:
    "Impact-Driven, Geographical Equity, Allocation & Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
