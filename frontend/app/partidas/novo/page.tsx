"use client";

import Criacao from "@/components/Criacao";
import PartidaForm from "@/components/PartidaForm";

export default function NovaPartidaPage() {
  return (
    <Criacao
      titulo="Nova partida"
      caminho="/partidas/"
      rota="/partidas"
      renderizar={(salvar) => <PartidaForm aoEnviar={salvar} />}
    />
  );
}
