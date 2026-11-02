import ComId from "@/components/ComId";
import EditarTime from "@/components/EditarTime";

export default function Page({ params }: PageProps<"/times/[id]/editar">) {
  return <ComId params={params}>{(id) => <EditarTime id={id} />}</ComId>;
}
