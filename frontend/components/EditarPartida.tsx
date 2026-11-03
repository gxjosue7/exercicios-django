"use client";

import Edicao from "@/components/Edicao";
import PartidaForm from "@/components/PartidaForm";
import type { Partida } from "@/lib/types";

export default function EditarPartida({ id }: { id: string }) {
  return (
    <Edicao<Partida>
      titulo="Editar partida"
      caminho={`/partidas/${id}/`}
      rota="/partidas"
      renderizar={(inicial, salvar) => (
        <PartidaForm
          inicial={inicial}
          // PUT é completo: status e placar não são editados aqui, vão como estão
          aoEnviar={(dados) =>
            salvar({
              ...dados,
              status: inicial.status,
              gols_mandante: inicial.gols_mandante,
              gols_visitante: inicial.gols_visitante,
            })
          }
        />
      )}
    />
  );
}
