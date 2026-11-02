import { Suspense } from "react";
import EditarCampeonato from "@/components/EditarCampeonato";

type Props = PageProps<"/campeonatos/[id]/editar">;

async function Conteudo({ params }: Pick<Props, "params">) {
  const { id } = await params;
  return <EditarCampeonato id={id} />;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <Conteudo params={params} />
    </Suspense>
  );
}
