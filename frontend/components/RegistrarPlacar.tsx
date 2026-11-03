"use client";

import { apiFetch } from "@/lib/api";
import type { Partida } from "@/lib/types";
import { useFormulario } from "@/lib/useFormulario";

export default function RegistrarPlacar({ partida, aoRegistrar }: { partida: Partida; aoRegistrar: () => void }) {
  const { erros, enviando, enviar } = useFormulario(async (f) => {
    await apiFetch(`/partidas/${partida.id}/registrar-placar/`, {
      method: "POST",
      body: JSON.stringify({
        gols_mandante: Number(f.get("gols_mandante")),
        gols_visitante: Number(f.get("gols_visitante")),
      }),
    });
    aoRegistrar();
  });
  const mensagens = Object.values(erros).flat();

  return (
    <form onSubmit={enviar} className="flex flex-wrap items-center gap-2" aria-label="Registrar placar">
      <label htmlFor={`gm-${partida.id}`} className="sr-only">Gols do mandante</label>
      <input id={`gm-${partida.id}`} name="gols_mandante" type="number" min={0} required className="input w-16 text-center" />
      <span aria-hidden="true">x</span>
      <label htmlFor={`gv-${partida.id}`} className="sr-only">Gols do visitante</label>
      <input id={`gv-${partida.id}`} name="gols_visitante" type="number" min={0} required className="input w-16 text-center" />
      <button type="submit" className="btn-sec" disabled={enviando}>
        {enviando ? "Salvando…" : "Registrar placar"}
      </button>
      {mensagens.length > 0 && (
        <p role="alert" className="w-full text-sm text-red-600">{mensagens.join(" ")}</p>
      )}
    </form>
  );
}
