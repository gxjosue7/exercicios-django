"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import type { Paginado } from "./types";

// shortcut: carrega só a primeira página (100 itens, o máximo da API); trocar por busca remota se passar disso
export function useOpcoes<T extends { id: number }>(endpoint: string | null) {
  const [itens, setItens] = useState<T[]>([]);

  useEffect(() => {
    if (!endpoint) return;
    let cancelado = false;
    const separador = endpoint.includes("?") ? "&" : "?";
    apiFetch<Paginado<T>>(`${endpoint}${separador}page_size=100&ordering=nome`)
      .then((r) => !cancelado && setItens(r.results))
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [endpoint]);

  return {
    itens: endpoint ? itens : [],
    nome: (id: number) => (itens.find((i) => i.id === id) as { nome?: string } | undefined)?.nome ?? `#${id}`,
  };
}
