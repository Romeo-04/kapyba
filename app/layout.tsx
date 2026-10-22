import type { Metadata, Viewport } from "next";
import { Baloo_2, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KapyBa",
  description: "Rate dishes in two taps. Cook what sells.",
};

export const viewport: Viewport = { themeColor: "#7b5544", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fil" className={`${baloo.variable} ${fredoka.variable} ${plusJakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
