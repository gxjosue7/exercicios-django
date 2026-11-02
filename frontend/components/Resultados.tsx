"use client";

import Link from "next/link";
import type { Lista } from "@/lib/useLista";

/** Aviso, estados de carregando/erro/vazio, itens e paginação de uma `useLista`. */
export default function Resultados<T extends { id: number }>({
  lista,
  vazio,
  item,
}: {
  lista: Lista<T>;
  vazio: string;
  item: (x: T) => React.ReactNode;
}) {
  const { dados, erro, carregando, aviso, page, setPage, pageSize, setPageSize } = lista;
  return (
    <>
      {aviso && (
        <p role="status" className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {aviso}
        </p>
      )}
      {erro ? (
        <p role="alert" className="text-red-600">{erro}</p>
      ) : !dados ? (
        <p>Carregando…</p>
      ) : dados.results.length === 0 ? (
        <p className="card text-slate-600 dark:text-slate-400">{vazio}</p>
      ) : (
        <div className={carregando ? "opacity-60" : undefined} aria-busy={carregando}>
          <ul className="space-y-3">
            {dados.results.map((x) => (
              <li key={x.id} className="card flex flex-wrap items-center gap-3">
                {item(x)}
              </li>
            ))}
          </ul>
          <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Paginação">
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize">Por página</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
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
      )}
    </>
  );
}

export function AcoesDoItem({
  editar,
  aoExcluir,
}: {
  editar: string;
  aoExcluir: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Link href={editar} className="btn-sec">Editar</Link>
      <button type="button" className="btn-perigo" onClick={aoExcluir}>Excluir</button>
    </div>
  );
}
