"use client";

import Link from "next/link";
import Campo from "@/components/Campo";
import Erros from "@/components/Erros";
import { useFormulario } from "@/lib/useFormulario";
import { type Campeonato, STATUS_CAMPEONATO } from "@/lib/types";

type Dados = Omit<Campeonato, "id">;

export default function CampeonatoForm({
  inicial,
  aoEnviar,
}: {
  inicial?: Campeonato;
  aoEnviar: (dados: Dados) => Promise<void>;
}) {
  const { erros, enviando, enviar } = useFormulario((f) =>
    aoEnviar({
      nome: String(f.get("nome")),
      modalidade: String(f.get("modalidade")),
      data_inicio: String(f.get("data_inicio")),
      data_fim: String(f.get("data_fim")),
      max_times: Number(f.get("max_times")),
      status: String(f.get("status")),
    } as Dados),
  );

  return (
    <form onSubmit={enviar} className="card grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Erros mensagens={erros.geral} />
      </div>
      <Campo id="nome" rotulo="Nome" erros={erros.nome} className="sm:col-span-2">
        <input id="nome" name="nome" defaultValue={inicial?.nome} required className="input" />
      </Campo>
      <Campo id="modalidade" rotulo="Modalidade" erros={erros.modalidade}>
        <input id="modalidade" name="modalidade" defaultValue={inicial?.modalidade} required className="input" />
      </Campo>
      <Campo id="max_times" rotulo="Máximo de times" erros={erros.max_times}>
        <input id="max_times" name="max_times" type="number" min={2} defaultValue={inicial?.max_times ?? 8} required className="input" />
      </Campo>
      <Campo id="data_inicio" rotulo="Início" erros={erros.data_inicio}>
        <input id="data_inicio" name="data_inicio" type="date" defaultValue={inicial?.data_inicio} required className="input" />
      </Campo>
      <Campo id="data_fim" rotulo="Fim" erros={erros.data_fim}>
        <input id="data_fim" name="data_fim" type="date" defaultValue={inicial?.data_fim} required className="input" />
      </Campo>
      <Campo id="status" rotulo="Status" erros={erros.status}>
        <select id="status" name="status" defaultValue={inicial?.status ?? "inscricoes"} className="input">
          {Object.entries(STATUS_CAMPEONATO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
      </Campo>
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </button>
        <Link href="/campeonatos" className="btn-sec">Cancelar</Link>
      </div>
    </form>
  );
}
