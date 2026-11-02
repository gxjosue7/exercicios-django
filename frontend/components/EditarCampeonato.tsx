"use client";

import CampeonatoForm from "@/components/CampeonatoForm";
import Edicao from "@/components/Edicao";
import type { Campeonato } from "@/lib/types";

export default function EditarCampeonato({ id }: { id: string }) {
  return (
    <Edicao<Campeonato>
      titulo="Editar campeonato"
      caminho={`/campeonatos/${id}/`}
      rota="/campeonatos"
      renderizar={(inicial, salvar) => <CampeonatoForm inicial={inicial} aoEnviar={salvar} />}
    />
  );
}
