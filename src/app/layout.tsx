import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { FullscreenProvider } from "@/context/FullscreenContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-monserrat",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "DCLR Photoboot",
  description: "DCLR Photoboot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased`}
      >
        <FullscreenProvider>
          {children}
        </FullscreenProvider>
      </body>
    </html>
  );
}
