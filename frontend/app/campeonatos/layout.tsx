import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Lista de campeonatos", template: "%s · Campeonatos" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
