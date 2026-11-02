"use client";

import Link from "next/link";
import { useState } from "react";
import Erros from "@/components/Erros";
import { errosDaApi } from "@/lib/api";
import { type Campeonato, STATUS_CAMPEONATO } from "@/lib/types";

type Dados = Omit<Campeonato, "id">;

export default function CampeonatoForm({
  inicial,
  aoEnviar,
}: {
  inicial?: Campeonato;
  aoEnviar: (dados: Dados) => Promise<void>;
}) {
  const [erros, setErros] = useState<Record<string, string[]>>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const dados = {
      nome: String(f.get("nome")),
      modalidade: String(f.get("modalidade")),
      data_inicio: String(f.get("data_inicio")),
      data_fim: String(f.get("data_fim")),
      max_times: Number(f.get("max_times")),
      status: String(f.get("status")),
    } as Dados;
    setEnviando(true);
    setErros({});
    try {
      await aoEnviar(dados);
    } catch (err) {
      setErros(errosDaApi(err));
      setEnviando(false);
    }
  }

  const campo = (nome: string) =>
    erros[nome]?.map((m) => (
      <p key={m} id={`${nome}-erro`} className="mt-1 text-sm text-red-600">
        {m}
      </p>
    ));

  return (
    <form onSubmit={enviar} className="card grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Erros mensagens={erros.geral} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="nome" className="mb-1 block text-sm font-medium">Nome</label>
        <input id="nome" name="nome" defaultValue={inicial?.nome} required className="input" aria-describedby="nome-erro" />
        {campo("nome")}
      </div>
      <div>
        <label htmlFor="modalidade" className="mb-1 block text-sm font-medium">Modalidade</label>
        <input id="modalidade" name="modalidade" defaultValue={inicial?.modalidade} required className="input" aria-describedby="modalidade-erro" />
        {campo("modalidade")}
      </div>
      <div>
        <label htmlFor="max_times" className="mb-1 block text-sm font-medium">Máximo de times</label>
        <input id="max_times" name="max_times" type="number" min={2} defaultValue={inicial?.max_times ?? 8} required className="input" aria-describedby="max_times-erro" />
        {campo("max_times")}
      </div>
      <div>
        <label htmlFor="data_inicio" className="mb-1 block text-sm font-medium">Início</label>
        <input id="data_inicio" name="data_inicio" type="date" defaultValue={inicial?.data_inicio} required className="input" aria-describedby="data_inicio-erro" />
        {campo("data_inicio")}
      </div>
      <div>
        <label htmlFor="data_fim" className="mb-1 block text-sm font-medium">Fim</label>
        <input id="data_fim" name="data_fim" type="date" defaultValue={inicial?.data_fim} required className="input" aria-describedby="data_fim-erro" />
        {campo("data_fim")}
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium">Status</label>
        <select id="status" name="status" defaultValue={inicial?.status ?? "inscricoes"} className="input">
          {Object.entries(STATUS_CAMPEONATO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
        {campo("status")}
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <Link href="/campeonatos" className="btn-sec">Cancelar</Link>
      </div>
    </form>
  );
}
