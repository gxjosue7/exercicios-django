"use client";

import { useEffect, useState } from "react";
import { apiFetch, mensagemDeErro } from "./api";
import type { Paginado } from "./types";

export function useLista<T>(endpoint: string, ordenacaoInicial: string) {
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [ordering, setOrdering] = useState(ordenacaoInicial);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [recarga, setRecarga] = useState(0);
  const [aviso, setAviso] = useState("");
  const [resultado, setResultado] = useState<{ chave: string; dados?: Paginado<T>; erro?: string }>({
    chave: "",
  });

  const params = new URLSearchParams({ ordering, page: String(page), page_size: String(pageSize) });
  if (buscaAplicada) params.set("search", buscaAplicada);
  for (const [nome, valor] of Object.entries(filtros)) if (valor) params.set(nome, valor);
  const consulta = params.toString();
  const chave = `${endpoint}?${consulta}|${recarga}`;

  useEffect(() => {
    let cancelado = false;
    apiFetch<Paginado<T>>(`${endpoint}?${consulta}`)
      .then((dados) => !cancelado && setResultado({ chave, dados }))
      .catch((e) => !cancelado && setResultado({ chave, erro: mensagemDeErro(e) }));
    return () => {
      cancelado = true;
    };
  }, [endpoint, consulta, recarga, chave]);

  async function excluir(id: number, confirmacao: string, sucesso: string) {
    if (!confirm(confirmacao)) return;
    try {
      await apiFetch(`${endpoint}${id}/`, { method: "DELETE" });
      setAviso(sucesso);
      setRecarga((n) => n + 1);
    } catch (e) {
      setAviso(mensagemDeErro(e));
    }
  }

  return {
    dados: resultado.dados,
    erro: resultado.erro,
    carregando: resultado.chave !== chave,
    aviso,
    busca,
    setBusca,
    aplicarBusca: () => {
      setBuscaAplicada(busca);
      setPage(1);
    },
    filtros,
    setFiltro: (nome: string, valor: string) => {
      setFiltros((f) => ({ ...f, [nome]: valor }));
      setPage(1);
    },
    ordering,
    setOrdering: (valor: string) => {
      setOrdering(valor);
      setPage(1);
    },
    pageSize,
    setPageSize: (valor: number) => {
      setPageSize(valor);
      setPage(1);
    },
    page,
    setPage,
    excluir,
    recarregar: () => setRecarga((n) => n + 1),
  };
}

export type Lista<T> = ReturnType<typeof useLista<T>>;
