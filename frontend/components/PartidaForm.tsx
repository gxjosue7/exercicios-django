"use client";

import Link from "next/link";
import { useState } from "react";
import Campo from "@/components/Campo";
import Erros from "@/components/Erros";
import { paraInputDataHora } from "@/lib/datas";
import type { Campeonato, Partida, Time } from "@/lib/types";
import { useFormulario } from "@/lib/useFormulario";
import { useOpcoes } from "@/lib/useOpcoes";

type Dados = Pick<Partida, "campeonato" | "mandante" | "visitante" | "data_hora">;

export default function PartidaForm({
  inicial,
  aoEnviar,
}: {
  inicial?: Partida;
  aoEnviar: (dados: Dados) => Promise<void>;
}) {
  const [campeonato, setCampeonato] = useState(inicial ? String(inicial.campeonato) : "");
  const campeonatos = useOpcoes<Campeonato>("/campeonatos/");
  // os times disponíveis são os do campeonato escolhido
  const times = useOpcoes<Time>(campeonato ? `/times/?campeonato=${campeonato}` : null);
  const { erros, enviando, enviar } = useFormulario((f) =>
    aoEnviar({
      campeonato: Number(f.get("campeonato")),
      mandante: Number(f.get("mandante")),
      visitante: Number(f.get("visitante")),
      data_hora: String(f.get("data_hora")),
    }),
  );

  const seletorDeTime = (nome: "mandante" | "visitante", rotulo: string) => (
    <Campo id={nome} rotulo={rotulo} erros={erros[nome]}>
      <select
        id={nome}
        name={nome}
        key={`${campeonato}-${times.itens.length}`}
        defaultValue={inicial?.[nome] ?? ""}
        required
        disabled={!campeonato}
        className="input"
        aria-describedby={`${nome}-erro`}
      >
        <option value="">{campeonato ? "Selecione…" : "Escolha o campeonato primeiro"}</option>
        {times.itens.map((t) => (
          <option key={t.id} value={t.id}>{t.nome}</option>
        ))}
      </select>
    </Campo>
  );

  return (
    <form onSubmit={enviar} className="card grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Erros mensagens={erros.geral} />
      </div>
      <Campo id="campeonato" rotulo="Campeonato" erros={erros.campeonato} className="sm:col-span-2">
        <select
          id="campeonato"
          name="campeonato"
          value={campeonato}
          onChange={(e) => setCampeonato(e.target.value)}
          required
          className="input"
          aria-describedby="campeonato-erro"
        >
          <option value="">Selecione…</option>
          {campeonatos.itens.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </Campo>
      {seletorDeTime("mandante", "Mandante")}
      {seletorDeTime("visitante", "Visitante")}
      <Campo id="data_hora" rotulo="Data e hora" erros={erros.data_hora} className="sm:col-span-2">
        <input
          id="data_hora"
          name="data_hora"
          type="datetime-local"
          defaultValue={inicial ? paraInputDataHora(inicial.data_hora) : ""}
          required
          className="input"
          aria-describedby="data_hora-erro"
        />
      </Campo>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <Link href="/partidas" className="btn-sec">Cancelar</Link>
      </div>
    </form>
  );
}
