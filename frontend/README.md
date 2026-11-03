# Frontend: Campeonatos

Interface em Next.js 16 (App Router), TypeScript e Tailwind CSS para a API de campeonatos (ver o README da raiz).

## Rodar

Com a API no ar em `http://localhost:8000`:

```bash
npm install
npm run dev
```

Abra http://localhost:3000. A URL da API vem de `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8000/api`); no backend, a origem do front é liberada por `CORS_ALLOWED_ORIGINS`.

Outros comandos: `npm run build` (build de produção), `npm run lint`.

## Telas

| Rota | O que faz |
|---|---|
| `/campeonatos` | lista com busca, filtro, ordenação e paginação; criar, editar e excluir |
| `/campeonatos/{id}/classificacao` | tabela de classificação |
| `/times`, `/jogadores` | lista, criar, editar e excluir |
| `/partidas` | lista com filtros (campeonato, time, status, período), criar, editar, excluir e registrar placar |
| `/login` | login com JWT |

Leitura é pública; criar, editar, excluir e registrar placar exigem login.

## Estrutura

- `app/`: rotas (cada pasta é uma URL); `layout.tsx` define menu, título e link de pular para o conteúdo.
- `components/`: formulários (`CampeonatoForm`, `TimeForm`, `JogadorForm`, `PartidaForm`), peças compartilhadas (`Resultados`, `BarraBusca`, `Campo`, `Criacao`, `Edicao`) e `Nav`.
- `lib/api.ts`: chamadas à API, tokens JWT (renovação automática) e tradução dos erros do DRF.
- `lib/useLista.ts`, `useFormulario.ts`, `useOpcoes.ts`, `useRegistro.ts`: hooks de lista paginada, envio de formulário, opções de selects e carga de um registro.

## Acessibilidade

Link para pular ao conteúdo, `aria-current` no menu, erros ligados aos campos (`aria-describedby` e `aria-invalid`), botões com nome do item (`aria-label`), título de aba por página e `color-scheme` para tema claro e escuro.
