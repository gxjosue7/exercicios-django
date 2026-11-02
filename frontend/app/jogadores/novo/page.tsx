"use client";

import Criacao from "@/components/Criacao";
import JogadorForm from "@/components/JogadorForm";

export default function NovoJogadorPage() {
  return (
    <Criacao
      titulo="Novo jogador"
      caminho="/jogadores/"
      rota="/jogadores"
      renderizar={(salvar) => <JogadorForm aoEnviar={salvar} />}
    />
  );
}
