"use client";

import Link from "next/link";
import BarraBusca, { Seletor } from "@/components/BarraBusca";
import Resultados, { AcoesDoItem } from "@/components/Resultados";
import type { Jogador, Time } from "@/lib/types";
import { useLista } from "@/lib/useLista";
import { useLogado } from "@/lib/useLogado";
import { useOpcoes } from "@/lib/useOpcoes";

const ORDENACOES: [string, string][] = [
  ["nome", "Nome (A-Z)"],
  ["-nome", "Nome (Z-A)"],
  ["numero_camisa", "Camisa (menor)"],
  ["-numero_camisa", "Camisa (maior)"],
];

export default function JogadoresPage() {
  const logado = useLogado();
  const lista = useLista<Jogador>("/jogadores/", "nome");
  const times = useOpcoes<Time>("/times/");

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Jogadores</h1>
        {logado && <Link href="/jogadores/novo" className="btn">Novo jogador</Link>}
      </div>

      <BarraBusca
        busca={lista.busca}
        setBusca={lista.setBusca}
        aoBuscar={lista.aplicarBusca}
        placeholder="Buscar por nome ou posição…"
      >
        <Seletor
          id="time"
          rotulo="Time"
          valor={lista.filtros.time ?? ""}
          aoMudar={(v) => lista.setFiltro("time", v)}
          opcoes={[["", "Todos os times"], ...times.itens.map((t): [string, string] => [String(t.id), t.nome])]}
        />
        <Seletor id="ordering" rotulo="Ordenar por" valor={lista.ordering} aoMudar={lista.setOrdering} opcoes={ORDENACOES} />
      </BarraBusca>

      <Resultados
        lista={lista}
        vazio="Nenhum jogador encontrado."
        item={(j) => (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              {j.numero_camisa}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{j.nome}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {j.posicao || "Sem posição"} · {times.nome(j.time)}
              </p>
            </div>
            {logado && (
              <AcoesDoItem
                nome={j.nome}
                editar={`/jogadores/${j.id}/editar`}
                aoExcluir={() => lista.excluir(j.id, `Excluir o jogador "${j.nome}"?`, `"${j.nome}" foi excluído.`)}
              />
            )}
          </>
        )}
      />
    </>
  );
}
