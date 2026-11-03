import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Partidas", template: "%s · Campeonatos" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
