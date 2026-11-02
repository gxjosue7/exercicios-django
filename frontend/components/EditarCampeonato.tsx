"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CampeonatoForm from "@/components/CampeonatoForm";
import { apiFetch, mensagemDeErro } from "@/lib/api";
import type { Campeonato } from "@/lib/types";
import { useLogado } from "@/lib/useLogado";

export default function EditarCampeonato({ id }: { id: string }) {
  const router = useRouter();
  const logado = useLogado();
  const [estado, setEstado] = useState<{ campeonato?: Campeonato; erro?: string }>({});

  useEffect(() => {
    let cancelado = false;
    apiFetch<Campeonato>(`/campeonatos/${id}/`)
      .then((campeonato) => !cancelado && setEstado({ campeonato }))
      .catch((e) => !cancelado && setEstado({ erro: mensagemDeErro(e) }));
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (!logado) {
    return (
      <p>
        Faça <Link href="/login" className="underline">login</Link> para editar um campeonato.
      </p>
    );
  }
  if (estado.erro) return <p role="alert" className="text-red-600">{estado.erro}</p>;
  if (!estado.campeonato) return <p>Carregando…</p>;

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Editar campeonato</h1>
      <CampeonatoForm
        inicial={estado.campeonato}
        aoEnviar={async (dados) => {
          // PUT = atualização completa
          await apiFetch(`/campeonatos/${id}/`, { method: "PUT", body: JSON.stringify(dados) });
          router.push("/campeonatos");
        }}
      />
    </>
  );
}
