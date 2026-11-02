"use client";

import Link from "next/link";
import BarraBusca, { Seletor } from "@/components/BarraBusca";
import Resultados, { AcoesDoItem } from "@/components/Resultados";
import type { Campeonato, Time } from "@/lib/types";
import { useLista } from "@/lib/useLista";
import { useLogado } from "@/lib/useLogado";
import { useOpcoes } from "@/lib/useOpcoes";

const ORDENACOES: [string, string][] = [
  ["nome", "Nome (A-Z)"],
  ["-nome", "Nome (Z-A)"],
  ["cidade", "Cidade (A-Z)"],
  ["ano_fundacao", "Fundação (mais antigo)"],
  ["-ano_fundacao", "Fundação (mais recente)"],
];

export default function TimesPage() {
  const logado = useLogado();
  const lista = useLista<Time>("/times/", "nome");
  const campeonatos = useOpcoes<Campeonato>("/campeonatos/");

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Times</h1>
        {logado && <Link href="/times/novo" className="btn">Novo time</Link>}
      </div>

      <BarraBusca
        busca={lista.busca}
        setBusca={lista.setBusca}
        aoBuscar={lista.aplicarBusca}
        placeholder="Buscar por nome, sigla, cidade ou descrição…"
      >
        <Seletor
          id="campeonato"
          rotulo="Campeonato"
          valor={lista.filtros.campeonato ?? ""}
          aoMudar={(v) => lista.setFiltro("campeonato", v)}
          opcoes={[["", "Todos os campeonatos"], ...campeonatos.itens.map((c): [string, string] => [String(c.id), c.nome])]}
        />
        <Seletor id="ordering" rotulo="Ordenar por" valor={lista.ordering} aoMudar={lista.setOrdering} opcoes={ORDENACOES} />
      </BarraBusca>

      <Resultados
        lista={lista}
        vazio="Nenhum time encontrado."
        item={(t) => (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {t.nome} <span className="text-sm font-normal text-slate-500">({t.sigla})</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.cidade}
                {t.ano_fundacao ? ` · fundado em ${t.ano_fundacao}` : ""} · {campeonatos.nome(t.campeonato)}
              </p>
              {t.descricao && <p className="mt-1 line-clamp-2 text-sm">{t.descricao}</p>}
            </div>
            {logado && (
              <AcoesDoItem
                editar={`/times/${t.id}/editar`}
                aoExcluir={() =>
                  lista.excluir(t.id, `Excluir o time "${t.nome}"? Os jogadores e partidas dele também serão apagados.`, `"${t.nome}" foi excluído.`)
                }
              />
            )}
          </>
        )}
      />
    </>
  );
}
