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

export type Time = {
  id: number;
  nome: string;
  sigla: string;
  cidade: string;
  ano_fundacao: number | null;
  descricao: string | null;
  campeonato: number;
};

export type Jogador = {
  id: number;
  nome: string;
  numero_camisa: number;
  posicao: string;
  time: number;
};

export type Paginado<T> = {
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
};
