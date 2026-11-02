"use client";

import Edicao from "@/components/Edicao";
import TimeForm from "@/components/TimeForm";
import type { Time } from "@/lib/types";

export default function EditarTime({ id }: { id: string }) {
  return (
    <Edicao<Time>
      titulo="Editar time"
      caminho={`/times/${id}/`}
      rota="/times"
      renderizar={(inicial, salvar) => <TimeForm inicial={inicial} aoEnviar={salvar} />}
    />
  );
}
