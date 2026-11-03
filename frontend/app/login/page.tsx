"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Erros from "@/components/Erros";
import { errosDaApi, login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [erros, setErros] = useState<Record<string, string[]>>({});
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErros({});
    try {
      await login(String(form.get("username")), String(form.get("password")));
      router.push("/campeonatos");
    } catch (err) {
      const e2 = errosDaApi(err);
      setErros(e2.geral ? { geral: ["Usuário ou senha inválidos."] } : e2);
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-semibold">Entrar</h1>
      <form onSubmit={entrar} className="card space-y-4">
        <Erros mensagens={erros.geral} />
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Usuário
          </label>
          <input id="username" name="username" autoComplete="username" required className="input" />
          {erros.username?.map((m) => (
            <p key={m} className="mt-1 text-sm text-red-600">{m}</p>
          ))}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
          />
          {erros.password?.map((m) => (
            <p key={m} className="mt-1 text-sm text-red-600">{m}</p>
          ))}
        </div>
        <button type="submit" className="btn w-full" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
