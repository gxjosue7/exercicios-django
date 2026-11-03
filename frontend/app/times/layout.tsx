import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Times", template: "%s · Campeonatos" } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
