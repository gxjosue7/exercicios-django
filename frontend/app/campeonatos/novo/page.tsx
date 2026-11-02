"use client";

import CampeonatoForm from "@/components/CampeonatoForm";
import Criacao from "@/components/Criacao";

export default function NovoCampeonatoPage() {
  return (
    <Criacao
      titulo="Novo campeonato"
      caminho="/campeonatos/"
      rota="/campeonatos"
      renderizar={(salvar) => <CampeonatoForm aoEnviar={salvar} />}
    />
  );
}
