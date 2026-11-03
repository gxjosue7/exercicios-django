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

export type StatusPartida = "agendada" | "finalizada";

export type Partida = {
  id: number;
  campeonato: number;
  mandante: number;
  visitante: number;
  data_hora: string;
  status: StatusPartida;
  gols_mandante: number | null;
  gols_visitante: number | null;
};

export type LinhaClassificacao = {
  posicao: number;
  time: number;
  nome: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo: number;
  pontos: number;
};

export type Paginado<T> = {
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
};
