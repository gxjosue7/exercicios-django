"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, mensagemDeErro } from "@/lib/api";
import { type Campeonato, type Paginado, STATUS_CAMPEONATO } from "@/lib/types";
import { useLogado } from "@/lib/useLogado";

const ORDENACOES = [
  ["nome", "Nome (A-Z)"],
  ["-nome", "Nome (Z-A)"],
  ["data_inicio", "Início (mais antigo)"],
  ["-data_inicio", "Início (mais recente)"],
  ["-max_times", "Mais times"],
];

const formatarData = (iso: string) => iso.split("-").reverse().join("/");

export default function CampeonatosPage() {
  const logado = useLogado();
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [status, setStatus] = useState("");
  const [ordering, setOrdering] = useState("nome");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [recarregar, setRecarregar] = useState(0);
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<{ chave: string; dados?: Paginado<Campeonato>; erro?: string }>({
    chave: "",
  });

  const params = new URLSearchParams({ ordering, page: String(page), page_size: String(pageSize) });
  if (buscaAplicada) params.set("search", buscaAplicada);
  if (status) params.set("status", status);
  const chave = `${params}|${recarregar}`;
  const carregando = resultado.chave !== chave;

  useEffect(() => {
    let cancelado = false;
    apiFetch<Paginado<Campeonato>>(`/campeonatos/?${params}`)
      .then((dados) => !cancelado && setResultado({ chave, dados }))
      .catch((e) => !cancelado && setResultado({ chave, erro: mensagemDeErro(e) }));
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `chave` já representa params e recarregar
  }, [chave]);

  async function excluir(c: Campeonato) {
    if (!confirm(`Excluir "${c.nome}"? Os times e partidas dele também serão apagados.`)) return;
    try {
      await apiFetch(`/campeonatos/${c.id}/`, { method: "DELETE" });
      setAviso(`"${c.nome}" foi excluído.`);
      setRecarregar((n) => n + 1);
    } catch (e) {
      setAviso(mensagemDeErro(e));
    }
  }

  const { dados, erro } = resultado;
  const mudar = (fn: () => void) => () => {
    fn();
    setPage(1);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Campeonatos</h1>
        {logado && (
          <Link href="/campeonatos/novo" className="btn">
            Novo campeonato
          </Link>
        )}
      </div>

      <form
        className="card mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          setBuscaAplicada(busca);
          setPage(1);
        }}
        role="search"
      >
        <div>
          <label htmlFor="busca" className="sr-only">Buscar por nome ou modalidade</label>
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou modalidade…"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="status" className="sr-only">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CAMPEONATO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ordering" className="sr-only">Ordenar por</label>
          <select
            id="ordering"
            value={ordering}
            onChange={(e) => {
              setOrdering(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            {ORDENACOES.map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn">Buscar</button>
      </form>

      {aviso && (
        <p role="status" className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {aviso}
        </p>
      )}

      {erro ? (
        <p role="alert" className="text-red-600">{erro}</p>
      ) : carregando && !dados ? (
        <p>Carregando…</p>
      ) : dados && dados.results.length === 0 ? (
        <p className="card text-slate-600 dark:text-slate-400">Nenhum campeonato encontrado.</p>
      ) : (
        dados && (
          <div className={carregando ? "opacity-60" : undefined} aria-busy={carregando}>
            <ul className="space-y-3">
              {dados.results.map((c) => (
                <li key={c.id} className="card flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.nome}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {c.modalidade} · {formatarData(c.data_inicio)} a {formatarData(c.data_fim)} · até {c.max_times} times
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs dark:bg-slate-800">
                    {STATUS_CAMPEONATO[c.status]}
                  </span>
                  {logado && (
                    <div className="flex gap-2">
                      <Link href={`/campeonatos/${c.id}/editar`} className="btn-sec">Editar</Link>
                      <button type="button" className="btn-perigo" onClick={() => excluir(c)}>
                        Excluir
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <nav className="mt-4 flex items-center justify-between gap-3 text-sm" aria-label="Paginação">
              <div className="flex items-center gap-2">
                <label htmlFor="pageSize">Por página</label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => mudar(() => setPageSize(Number(e.target.value)))()}
                  className="input w-auto"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="btn-sec" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </button>
                <span>Página {dados.page} de {Math.max(dados.total_pages, 1)}</span>
                <button
                  type="button"
                  className="btn-sec"
                  disabled={page >= dados.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </button>
              </div>
            </nav>
          </div>
        )
      )}
    </>
  );
}
