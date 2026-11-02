import ComId from "@/components/ComId";
import EditarCampeonato from "@/components/EditarCampeonato";

export default function Page({ params }: PageProps<"/campeonatos/[id]/editar">) {
  return <ComId params={params}>{(id) => <EditarCampeonato id={id} />}</ComId>;
}
