"use client";

import Link from "next/link";
import BarraBusca, { Seletor } from "@/components/BarraBusca";
import Resultados, { AcoesDoItem } from "@/components/Resultados";
import { type Campeonato, STATUS_CAMPEONATO } from "@/lib/types";
import { useLista } from "@/lib/useLista";
import { useLogado } from "@/lib/useLogado";

const ORDENACOES: [string, string][] = [
  ["nome", "Nome (A-Z)"],
  ["-nome", "Nome (Z-A)"],
  ["data_inicio", "Início (mais antigo)"],
  ["-data_inicio", "Início (mais recente)"],
  ["-max_times", "Mais times"],
];

const STATUS: [string, string][] = [["", "Todos os status"], ...Object.entries(STATUS_CAMPEONATO)];

const formatarData = (iso: string) => iso.split("-").reverse().join("/");

export default function CampeonatosPage() {
  const logado = useLogado();
  const lista = useLista<Campeonato>("/campeonatos/", "nome");

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Campeonatos</h1>
        {logado && <Link href="/campeonatos/novo" className="btn">Novo campeonato</Link>}
      </div>

      <BarraBusca
        busca={lista.busca}
        setBusca={lista.setBusca}
        aoBuscar={lista.aplicarBusca}
        placeholder="Buscar por nome ou modalidade…"
      >
        <Seletor id="status" rotulo="Status" valor={lista.filtros.status ?? ""} aoMudar={(v) => lista.setFiltro("status", v)} opcoes={STATUS} />
        <Seletor id="ordering" rotulo="Ordenar por" valor={lista.ordering} aoMudar={lista.setOrdering} opcoes={ORDENACOES} />
      </BarraBusca>

      <Resultados
        lista={lista}
        vazio="Nenhum campeonato encontrado."
        item={(c) => (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.nome}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {c.modalidade} · {formatarData(c.data_inicio)} a {formatarData(c.data_fim)} · até {c.max_times} times
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs dark:bg-slate-800">
              {STATUS_CAMPEONATO[c.status]}
            </span>
            <Link href={`/campeonatos/${c.id}/classificacao`} className="btn-sec">Classificação</Link>
            {logado && (
              <AcoesDoItem
                editar={`/campeonatos/${c.id}/editar`}
                aoExcluir={() =>
                  lista.excluir(
                    c.id,
                    `Excluir "${c.nome}"? Os times e partidas dele também serão apagados.`,
                    `"${c.nome}" foi excluído.`,
                  )
                }
              />
            )}
          </>
        )}
      />
    </>
  );
}
