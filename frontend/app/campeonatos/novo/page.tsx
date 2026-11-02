"use client";

import { useRouter } from "next/navigation";
import CampeonatoForm from "@/components/CampeonatoForm";
import { apiFetch } from "@/lib/api";
import { useLogado } from "@/lib/useLogado";
import Link from "next/link";

export default function NovoCampeonatoPage() {
  const router = useRouter();
  const logado = useLogado();

  if (!logado) {
    return (
      <p>
        Faça <Link href="/login" className="underline">login</Link> para criar um campeonato.
      </p>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Novo campeonato</h1>
      <CampeonatoForm
        aoEnviar={async (dados) => {
          await apiFetch("/campeonatos/", { method: "POST", body: JSON.stringify(dados) });
          router.push("/campeonatos");
        }}
      />
    </>
  );
}
