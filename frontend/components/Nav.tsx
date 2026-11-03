"use client";

import Link from "next/link";
import { limparTokens } from "@/lib/api";
import { useLogado } from "@/lib/useLogado";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/campeonatos", "Campeonatos"],
  ["/times", "Times"],
  ["/jogadores", "Jogadores"],
  ["/partidas", "Partidas"],
];

export default function Nav() {
  const logado = useLogado();
  const caminho = usePathname();
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3" aria-label="Principal">
        {LINKS.map(([href, rotulo]) => {
          const atual = caminho.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={atual ? "page" : undefined} className={atual ? "font-semibold" : undefined}>
              {rotulo}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-3 text-sm">
          {logado ? (
            <button type="button" className="btn-sec" onClick={limparTokens}>
              Sair
            </button>
          ) : (
            <Link href="/login" className="btn-sec">
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
