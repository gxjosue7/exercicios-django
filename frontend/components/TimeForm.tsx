"use client";

import Link from "next/link";
import Campo from "@/components/Campo";
import Erros from "@/components/Erros";
import type { Campeonato, Time } from "@/lib/types";
import { useFormulario } from "@/lib/useFormulario";
import { useOpcoes } from "@/lib/useOpcoes";

type Dados = Omit<Time, "id">;

export default function TimeForm({
  inicial,
  aoEnviar,
}: {
  inicial?: Time;
  aoEnviar: (dados: Dados) => Promise<void>;
}) {
  const campeonatos = useOpcoes<Campeonato>("/campeonatos/");
  const { erros, enviando, enviar } = useFormulario((f) =>
    aoEnviar({
      nome: String(f.get("nome")),
      sigla: String(f.get("sigla")),
      cidade: String(f.get("cidade")),
      ano_fundacao: f.get("ano_fundacao") ? Number(f.get("ano_fundacao")) : null,
      descricao: String(f.get("descricao")) || null,
      campeonato: Number(f.get("campeonato")),
    }),
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
          // key força o select a assumir o valor inicial quando as opções terminam de carregar
          key={campeonatos.itens.length}
          defaultValue={inicial?.campeonato ?? ""}
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
      <Campo id="nome" rotulo="Nome" erros={erros.nome}>
        <input id="nome" name="nome" defaultValue={inicial?.nome} required className="input" aria-describedby="nome-erro" />
      </Campo>
      <Campo id="sigla" rotulo="Sigla" erros={erros.sigla}>
        <input id="sigla" name="sigla" maxLength={5} defaultValue={inicial?.sigla} required className="input" aria-describedby="sigla-erro" />
      </Campo>
      <Campo id="cidade" rotulo="Cidade" erros={erros.cidade}>
        <input id="cidade" name="cidade" maxLength={50} defaultValue={inicial?.cidade} required className="input" aria-describedby="cidade-erro" />
      </Campo>
      <Campo id="ano_fundacao" rotulo="Ano de fundação (opcional)" erros={erros.ano_fundacao}>
        <input id="ano_fundacao" name="ano_fundacao" type="number" defaultValue={inicial?.ano_fundacao ?? ""} className="input" aria-describedby="ano_fundacao-erro" />
      </Campo>
      <Campo id="descricao" rotulo="Descrição (opcional, até 500 caracteres)" erros={erros.descricao} className="sm:col-span-2">
        <textarea id="descricao" name="descricao" rows={3} defaultValue={inicial?.descricao ?? ""} className="input" aria-describedby="descricao-erro" />
      </Campo>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <Link href="/times" className="btn-sec">Cancelar</Link>
      </div>
    </form>
  );
}
