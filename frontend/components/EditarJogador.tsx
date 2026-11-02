"use client";

import Edicao from "@/components/Edicao";
import JogadorForm from "@/components/JogadorForm";
import type { Jogador } from "@/lib/types";

export default function EditarJogador({ id }: { id: string }) {
  return (
    <Edicao<Jogador>
      titulo="Editar jogador"
      caminho={`/jogadores/${id}/`}
      rota="/jogadores"
      renderizar={(inicial, salvar) => <JogadorForm inicial={inicial} aoEnviar={salvar} />}
    />
  );
}
