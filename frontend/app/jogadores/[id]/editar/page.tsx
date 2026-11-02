import ComId from "@/components/ComId";
import EditarJogador from "@/components/EditarJogador";

export default function Page({ params }: PageProps<"/jogadores/[id]/editar">) {
  return <ComId params={params}>{(id) => <EditarJogador id={id} />}</ComId>;
}
