import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { BottomNav, TopBar } from "@/src/ui/Chrome";
import { KapyBuddy } from "@/src/ui/KapyBuddy";
import { Splash } from "@/src/ui/Splash";
import { RegisterSW } from "@/src/ui/RegisterSW";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KapyBa",
  icons: { apple: "/icons/apple-touch-icon.png" },
  description: "Rate dishes in two taps. Cook what sells.",
};

export const viewport: Viewport = { themeColor: "#fdfaf3", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fil" className={sans.variable}>
      <body>
        <a className="skip" href="#main">Lumaktaw sa nilalaman</a>
        <RegisterSW />
        <Suspense fallback={null}>
          <Splash />
        </Suspense>
        <TopBar />
        {children}
        <Suspense fallback={null}>
          <KapyBuddy />
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
