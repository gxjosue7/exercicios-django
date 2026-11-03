const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const ACCESS = "token_access";
const REFRESH = "token_refresh";

const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((f) => f());

export function observarLogin(callback: () => void) {
  ouvintes.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    ouvintes.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export const estaLogado = () => !!localStorage.getItem(ACCESS);

export function salvarTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS, access);
  if (refresh) localStorage.setItem(REFRESH, refresh);
  avisar();
}

export function limparTokens() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  avisar();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`HTTP ${status}`);
  }
}

async function renovarToken(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH);
  if (!refresh) return false;
  const res = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  salvarTokens(data.access, data.refresh);
  return true;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const enviar = () => {
    const token = localStorage.getItem(ACCESS);
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  };

  let res = await enviar();
  if (res.status === 401 && localStorage.getItem(ACCESS)) {
    if (!(await renovarToken())) limparTokens();
    res = await enviar();
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export async function login(username: string, password: string) {
  const data = await apiFetch<{ access: string; refresh: string }>("/auth/token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  salvarTokens(data.access, data.refresh);
}

export function errosDaApi(e: unknown): Record<string, string[]> {
  if (!(e instanceof ApiError)) return { geral: ["Não foi possível conectar à API."] };
  const d = e.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const saida: Record<string, string[]> = {};
    for (const [chave, valor] of Object.entries(d as Record<string, unknown>)) {
      const msgs = (Array.isArray(valor) ? valor : [valor]).map(String);
      const campo = chave === "detail" || chave === "non_field_errors" ? "geral" : chave;
      saida[campo] = [...(saida[campo] ?? []), ...msgs];
    }
    if (e.status === 401 && !saida.geral) saida.geral = ["Faça login para continuar."];
    return saida;
  }
  return { geral: [`Erro ${e.status} na API.`] };
}

export const mensagemDeErro = (e: unknown) => Object.values(errosDaApi(e)).flat().join(" ");
