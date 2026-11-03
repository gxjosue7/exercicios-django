import ComId from "@/components/ComId";
import Classificacao from "@/components/Classificacao";

export default function Page({ params }: PageProps<"/campeonatos/[id]/classificacao">) {
  return <ComId params={params}>{(id) => <Classificacao id={id} />}</ComId>;
}
