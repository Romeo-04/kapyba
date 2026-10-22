import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { BottomNav, TopBar } from "@/src/ui/Chrome";
import { RegisterSW } from "@/src/ui/RegisterSW";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KapyBa",
  icons: { apple: "/icons/apple-touch-icon.png" },
  description: "Rate dishes in two taps. Cook what sells.",
};

export const viewport: Viewport = { themeColor: "#7b5544", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fil" className={geist.variable}>
      <body>
        <RegisterSW />
        <TopBar />
        {children}
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
