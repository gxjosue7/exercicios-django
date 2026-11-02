"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLogado } from "@/lib/useLogado";

/** Página "novo": exige login, envia `POST` para `caminho` e volta para `rota`. */
export default function Criacao({
  titulo,
  caminho,
  rota,
  renderizar,
}: {
  titulo: string;
  caminho: string;
  rota: string;
  renderizar: (salvar: (dados: unknown) => Promise<void>) => React.ReactNode;
}) {
  const router = useRouter();
  const logado = useLogado();

  if (!logado) {
    return (
      <p>
        Faça <Link href="/login" className="underline">login</Link> para continuar.
      </p>
    );
  }
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{titulo}</h1>
      {renderizar(async (dados) => {
        await apiFetch(caminho, { method: "POST", body: JSON.stringify(dados) });
        router.push(rota);
      })}
    </>
  );
}
