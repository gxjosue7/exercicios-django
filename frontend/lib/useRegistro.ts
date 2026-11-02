"use client";

import { useEffect, useState } from "react";
import { apiFetch, mensagemDeErro } from "./api";

/** Carrega um registro (ex.: `/times/3/`) para a tela de edição. */
export function useRegistro<T>(caminho: string) {
  const [estado, setEstado] = useState<{ registro?: T; erro?: string }>({});

  useEffect(() => {
    let cancelado = false;
    apiFetch<T>(caminho)
      .then((registro) => !cancelado && setEstado({ registro }))
      .catch((e) => !cancelado && setEstado({ erro: mensagemDeErro(e) }));
    return () => {
      cancelado = true;
    };
  }, [caminho]);

  return estado;
}
