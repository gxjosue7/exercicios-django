"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useLogado } from "@/lib/useLogado";
import { useRegistro } from "@/lib/useRegistro";

export default function Edicao<T>({
  titulo,
  caminho,
  rota,
  renderizar,
}: {
  titulo: string;
  caminho: string;
  rota: string;
  renderizar: (inicial: T, salvar: (dados: unknown) => Promise<void>) => React.ReactNode;
}) {
  const router = useRouter();
  const logado = useLogado();
  const { registro, erro } = useRegistro<T>(caminho);

  if (!logado) {
    return (
      <p>
        Faça <Link href="/login" className="underline">login</Link> para continuar.
      </p>
    );
  }
  if (erro) return <p role="alert" className="text-red-600">{erro}</p>;
  if (!registro) return <p>Carregando…</p>;

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{titulo}</h1>
      {renderizar(registro, async (dados) => {
        await apiFetch(caminho, { method: "PUT", body: JSON.stringify(dados) });
        router.push(rota);
      })}
    </>
  );
}
