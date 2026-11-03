import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Campeonatos", template: "%s · Campeonatos" },
  description: "Gerenciador de campeonatos, times, jogadores e partidas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-emerald-700 focus:px-3 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo
        </a>
        <Suspense fallback={<div className="h-[53px] border-b border-slate-200 dark:border-slate-700" />}>
          <Nav />
        </Suspense>
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
