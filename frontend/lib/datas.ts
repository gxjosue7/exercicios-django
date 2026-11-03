// A API trabalha em UTC e o app mostra o horário "como digitado" (sem converter fuso).
// shortcut: sem conversão de fuso, aceitável com um só fuso de uso; usar Intl se isso mudar.

/** "2026-12-02T15:00:00Z" -> "02/12/2026 15:00" */
export function formatarDataHora(iso: string) {
  const [data, hora] = iso.split("T");
  return `${data.split("-").reverse().join("/")} ${hora.slice(0, 5)}`;
}

/** "2026-12-02T15:00:00Z" -> "2026-12-02T15:00" (valor de <input type="datetime-local">) */
export const paraInputDataHora = (iso: string) => iso.slice(0, 16);
