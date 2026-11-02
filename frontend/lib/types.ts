export type StatusCampeonato = "inscricoes" | "andamento" | "encerrado";

export const STATUS_CAMPEONATO: Record<StatusCampeonato, string> = {
  inscricoes: "Inscrições abertas",
  andamento: "Em andamento",
  encerrado: "Encerrado",
};

export type Campeonato = {
  id: number;
  nome: string;
  modalidade: string;
  data_inicio: string;
  data_fim: string;
  max_times: number;
  status: StatusCampeonato;
};

export type Paginado<T> = {
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
};
