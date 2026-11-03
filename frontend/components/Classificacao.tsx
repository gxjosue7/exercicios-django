"use client";

import Link from "next/link";
import type { Campeonato, LinhaClassificacao } from "@/lib/types";
import { useRegistro } from "@/lib/useRegistro";

const COLUNAS: [keyof LinhaClassificacao, string, string][] = [
  ["pontos", "P", "Pontos"],
  ["jogos", "J", "Jogos"],
  ["vitorias", "V", "Vitórias"],
  ["empates", "E", "Empates"],
  ["derrotas", "D", "Derrotas"],
  ["gols_pro", "GP", "Gols pró"],
  ["gols_contra", "GC", "Gols contra"],
  ["saldo", "SG", "Saldo de gols"],
];

export default function Classificacao({ id }: { id: string }) {
  const campeonato = useRegistro<Campeonato>(`/campeonatos/${id}/`);
  const tabela = useRegistro<LinhaClassificacao[]>(`/campeonatos/${id}/classificacao/`);

  if (tabela.erro || campeonato.erro) {
    return <p role="alert" className="text-red-600">{tabela.erro ?? campeonato.erro}</p>;
  }
  if (!tabela.registro || !campeonato.registro) return <p>Carregando…</p>;

  return (
    <>
      <Link href="/campeonatos" className="text-sm underline">← Campeonatos</Link>
      <h1 className="mb-1 mt-2 text-2xl font-semibold">Classificação</h1>
      <p className="mb-4 text-slate-600 dark:text-slate-400">{campeonato.registro.nome}</p>

      {tabela.registro.length === 0 ? (
        <p className="card text-slate-600 dark:text-slate-400">Este campeonato ainda não tem times.</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Classificação de {campeonato.registro.nome}</caption>
            <thead className="border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-3 py-2">#</th>
                <th scope="col" className="px-3 py-2">Time</th>
                {COLUNAS.map(([chave, sigla, nome]) => (
                  <th key={chave} scope="col" className="px-3 py-2 text-right" title={nome}>
                    <abbr title={nome} className="no-underline">{sigla}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabela.registro.map((l) => (
                <tr key={l.time} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-3 py-2">{l.posicao}</td>
                  <th scope="row" className="px-3 py-2 font-medium">{l.nome}</th>
                  {COLUNAS.map(([chave]) => (
                    <td key={chave} className={`px-3 py-2 text-right tabular-nums ${chave === "pontos" ? "font-semibold" : ""}`}>
                      {l[chave]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
