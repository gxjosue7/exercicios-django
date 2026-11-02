"use client";

import Link from "next/link";
import Campo from "@/components/Campo";
import Erros from "@/components/Erros";
import type { Jogador, Time } from "@/lib/types";
import { useFormulario } from "@/lib/useFormulario";
import { useOpcoes } from "@/lib/useOpcoes";

type Dados = Omit<Jogador, "id">;

export default function JogadorForm({
  inicial,
  aoEnviar,
}: {
  inicial?: Jogador;
  aoEnviar: (dados: Dados) => Promise<void>;
}) {
  const times = useOpcoes<Time>("/times/");
  const { erros, enviando, enviar } = useFormulario((f) =>
    aoEnviar({
      nome: String(f.get("nome")),
      numero_camisa: Number(f.get("numero_camisa")),
      posicao: String(f.get("posicao")),
      time: Number(f.get("time")),
    }),
  );

  return (
    <form onSubmit={enviar} className="card grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Erros mensagens={erros.geral} />
      </div>
      <Campo id="time" rotulo="Time" erros={erros.time} className="sm:col-span-2">
        <select
          id="time"
          name="time"
          key={times.itens.length}
          defaultValue={inicial?.time ?? ""}
          required
          className="input"
          aria-describedby="time-erro"
        >
          <option value="">Selecione…</option>
          {times.itens.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </Campo>
      <Campo id="nome" rotulo="Nome" erros={erros.nome} className="sm:col-span-2">
        <input id="nome" name="nome" defaultValue={inicial?.nome} required className="input" aria-describedby="nome-erro" />
      </Campo>
      <Campo id="numero_camisa" rotulo="Número da camisa (1 a 99)" erros={erros.numero_camisa}>
        <input id="numero_camisa" name="numero_camisa" type="number" min={1} max={99} defaultValue={inicial?.numero_camisa} required className="input" aria-describedby="numero_camisa-erro" />
      </Campo>
      <Campo id="posicao" rotulo="Posição (opcional)" erros={erros.posicao}>
        <input id="posicao" name="posicao" maxLength={30} defaultValue={inicial?.posicao} className="input" aria-describedby="posicao-erro" />
      </Campo>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <Link href="/jogadores" className="btn-sec">Cancelar</Link>
      </div>
    </form>
  );
}
