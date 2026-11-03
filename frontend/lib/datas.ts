const dataCurta = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

export const formatarData = (iso: string) => dataCurta.format(new Date(iso));

export const formatarDataHora = (iso: string) => dataHora.format(new Date(iso)).replace(",", "");

export const paraInputDataHora = (iso: string) => iso.slice(0, 16);
