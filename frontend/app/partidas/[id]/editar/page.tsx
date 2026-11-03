import type { Metadata } from "next";
import ComId from "@/components/ComId";
import EditarPartida from "@/components/EditarPartida";

export const metadata: Metadata = { title: "Editar partida" };

export default function Page({ params }: PageProps<"/partidas/[id]/editar">) {
  return <ComId params={params}>{(id) => <EditarPartida id={id} />}</ComId>;
}
