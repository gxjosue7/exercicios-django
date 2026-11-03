"use client";

import { useState } from "react";
import { errosDaApi } from "./api";

export function useFormulario(processar: (dados: FormData) => Promise<void>) {
  const [erros, setErros] = useState<Record<string, string[]>>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const dados = new FormData(e.currentTarget);
    setEnviando(true);
    setErros({});
    try {
      await processar(dados);
    } catch (err) {
      setErros(errosDaApi(err));
      setEnviando(false);
    }
  }

  return { erros, enviando, enviar };
}
