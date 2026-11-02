"use client";

import Criacao from "@/components/Criacao";
import TimeForm from "@/components/TimeForm";

export default function NovoTimePage() {
  return (
    <Criacao
      titulo="Novo time"
      caminho="/times/"
      rota="/times"
      renderizar={(salvar) => <TimeForm aoEnviar={salvar} />}
    />
  );
}
