"use client";

import Link from "next/link";
import BarraBusca, { Seletor } from "@/components/BarraBusca";
import RegistrarPlacar from "@/components/RegistrarPlacar";
import Resultados, { AcoesDoItem } from "@/components/Resultados";
import { formatarDataHora } from "@/lib/datas";
import type { Campeonato, Partida, Time } from "@/lib/types";
import { useLista } from "@/lib/useLista";
import { useLogado } from "@/lib/useLogado";
import { useOpcoes } from "@/lib/useOpcoes";

const ORDENACOES: [string, string][] = [
  ["data_hora", "Data (mais antiga)"],
  ["-data_hora", "Data (mais recente)"],
  ["status", "Status"],
];

const STATUS: [string, string][] = [
  ["", "Todos os status"],
  ["agendada", "Agendadas"],
  ["finalizada", "Finalizadas"],
];

export default function PartidasPage() {
  const logado = useLogado();
  const lista = useLista<Partida>("/partidas/", "data_hora");
  const campeonatos = useOpcoes<Campeonato>("/campeonatos/");
  const times = useOpcoes<Time>("/times/");
  const f = lista.filtros;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Partidas</h1>
        {logado && <Link href="/partidas/novo" className="btn">Nova partida</Link>}
      </div>

      <BarraBusca
        busca={lista.busca}
        setBusca={lista.setBusca}
        aoBuscar={lista.aplicarBusca}
        placeholder="Buscar pelo nome de um time…"
      >
        <Seletor
          id="campeonato"
          rotulo="Campeonato"
          valor={f.campeonato ?? ""}
          aoMudar={(v) => lista.setFiltro("campeonato", v)}
          opcoes={[["", "Todos os campeonatos"], ...campeonatos.itens.map((c): [string, string] => [String(c.id), c.nome])]}
        />
        <Seletor
          id="time"
          rotulo="Time"
          valor={f.time ?? ""}
          aoMudar={(v) => lista.setFiltro("time", v)}
          opcoes={[["", "Todos os times"], ...times.itens.map((t): [string, string] => [String(t.id), t.nome])]}
        />
        <Seletor id="status" rotulo="Status" valor={f.status ?? ""} aoMudar={(v) => lista.setFiltro("status", v)} opcoes={STATUS} />
        <div>
          <label htmlFor="data_de" className="sr-only">Data inicial</label>
          <input
            id="data_de"
            type="date"
            title="A partir de"
            value={f.data_de ?? ""}
            onChange={(e) => lista.setFiltro("data_de", e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="data_ate" className="sr-only">Data final</label>
          <input
            id="data_ate"
            type="date"
            title="Até"
            value={(f.data_ate ?? "").slice(0, 10)}
            // inclui o dia inteiro: o filtro da API compara com data e hora
            onChange={(e) => lista.setFiltro("data_ate", e.target.value ? `${e.target.value}T23:59:59` : "")}
            className="input"
          />
        </div>
        <Seletor id="ordering" rotulo="Ordenar por" valor={lista.ordering} aoMudar={lista.setOrdering} opcoes={ORDENACOES} />
      </BarraBusca>

      <Resultados
        lista={lista}
        vazio="Nenhuma partida encontrada."
        item={(p) => (
          <>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {times.nome(p.mandante)}{" "}
                {p.status === "finalizada" ? (
                  <span className="mx-1 rounded bg-slate-100 px-2 py-0.5 font-semibold dark:bg-slate-800">
                    {p.gols_mandante} x {p.gols_visitante}
                  </span>
                ) : (
                  "x"
                )}{" "}
                {times.nome(p.visitante)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {formatarDataHora(p.data_hora)} · {campeonatos.nome(p.campeonato)} ·{" "}
                {p.status === "finalizada" ? "Finalizada" : "Agendada"}
              </p>
            </div>
            {logado && p.status === "agendada" && <RegistrarPlacar partida={p} aoRegistrar={lista.recarregar} />}
            {logado && (
              <AcoesDoItem
                editar={`/partidas/${p.id}/editar`}
                aoExcluir={() =>
                  lista.excluir(
                    p.id,
                    `Excluir a partida ${times.nome(p.mandante)} x ${times.nome(p.visitante)}?`,
                    "Partida excluída.",
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
