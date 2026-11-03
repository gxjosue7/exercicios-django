import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Jogadores", template: "%s · Campeonatos" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
