import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KapyBa",
  description: "Rate dishes in two taps. Cook what sells.",
};

export const viewport: Viewport = { themeColor: "#7b5544", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fil" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
