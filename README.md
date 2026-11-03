# API de Campeonatos

Projeto final de Desenvolvimento Web II (BSI, IFC Araquari): uma API REST para gerenciar **campeonatos, times, jogadores e partidas**, com frontend em Next.js.

- **Backend:** Django 6 + Django REST Framework, SQLite, JWT (`djangorestframework-simplejwt`), Swagger (`drf-spectacular`), `django-filter`.
- **Frontend:** Next.js 16 (App Router), TypeScript e Tailwind CSS, na pasta [frontend/](frontend/).
- **Gerenciador de pacotes Python:** [uv](https://docs.astral.sh/uv/).

## Sumário

1. [Domínio e regras de negócio](#domínio-e-regras-de-negócio)
2. [Instalação e execução](#instalação-e-execução)
3. [Credenciais de teste](#credenciais-de-teste)
4. [Autenticação](#autenticação)
5. [Endpoints](#endpoints)
6. [Filtro, busca, ordenação e paginação](#filtro-busca-ordenação-e-paginação)
7. [Validações e erros](#validações-e-erros)
8. [Frontend](#frontend)
9. [Testes](#testes)
10. [Estrutura do projeto](#estrutura-do-projeto)
11. [Publicação](#publicação)
12. [Histórico dos passos](#histórico-dos-passos)

## Domínio e regras de negócio

| Entidade | Campos | Observações |
|---|---|---|
| `Campeonato` | `nome`, `modalidade`, `data_inicio`, `data_fim`, `max_times`, `status` | `status`: `inscricoes`, `andamento` ou `encerrado` |
| `Time` | `nome`, `sigla`, `cidade`, `ano_fundacao` (opcional), `descricao` (opcional), `campeonato` | pertence a um campeonato; nome único por campeonato |
| `Jogador` | `nome`, `numero_camisa`, `posicao` (opcional), `time` | pertence a um time; camisa única por time |
| `Partida` | `campeonato`, `mandante`, `visitante`, `data_hora`, `status`, `gols_mandante`, `gols_visitante` | `status`: `agendada` ou `finalizada`; gols vazios até finalizar |

Relações: um campeonato tem vários times e partidas; um time tem vários jogadores; uma partida liga dois times do mesmo campeonato. Apagar um campeonato apaga seus times, jogadores e partidas.

**Regras de negócio** (aplicadas no backend):

1. Só é possível cadastrar um time se o campeonato estiver com `status` = `inscricoes` e ainda houver vaga (`max_times`).
2. Em uma partida, mandante e visitante devem ser times diferentes e pertencer ao campeonato da partida.
3. Um time não pode ter duas partidas no mesmo horário.
4. Partida `agendada` não tem placar; partida `finalizada` exige placar completo e **não aceita novo placar**.
5. O placar é registrado por `POST /api/partidas/{id}/registrar-placar/`, que finaliza a partida. Se ela já estava finalizada, a resposta é `409`.
6. A classificação do campeonato considera só partidas finalizadas: vitória 3 pontos, empate 1, derrota 0. Desempate: pontos, saldo de gols, gols pró e nome.

## Instalação e execução

Requisitos: **Python 3.14+**, **[uv](https://docs.astral.sh/uv/)** e **Node.js 18+** (para o frontend).

### Backend

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

| O quê | Endereço |
|---|---|
| API | http://127.0.0.1:8000/api/ |
| Swagger | http://127.0.0.1:8000/api/docs/ |
| Redoc | http://127.0.0.1:8000/api/redoc/ |
| Schema OpenAPI | http://127.0.0.1:8000/api/schema/ |
| Django Admin | http://127.0.0.1:8000/admin/ |

O banco é SQLite (`db.sqlite3`), criado pelo `migrate` e ignorado pelo Git. Os dados persistem entre reinícios do servidor.

### Frontend

Com a API no ar:

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:3000.

### Variáveis de ambiente

Todas são opcionais em desenvolvimento. Não há segredos no repositório.

| Variável | Onde | Padrão | Para quê |
|---|---|---|---|
| `SECRET_KEY` | backend | chave de desenvolvimento | chave secreta do Django (obrigatória em produção) |
| `DEBUG` | backend | `1` | use `0` em produção |
| `ALLOWED_HOSTS` | backend | vazio | hosts permitidos, separados por vírgula |
| `CORS_ALLOWED_ORIGINS` | backend | `http://localhost:3000` | origens do frontend, separadas por vírgula |
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000/api` | URL base da API |

## Credenciais de teste

Usuários de **desenvolvimento**, que existem apenas no `db.sqlite3` local (não vão para o GitHub):

| Usuário | Senha | Acesso |
|---|---|---|
| `admin` | `admin123` | Django Admin, API e frontend |
| `teste` | `teste123` | API e frontend |

Em outro ambiente, crie um usuário com `uv run python manage.py createsuperuser`.

## Autenticação

JWT. A leitura (`GET`) é pública; criar, alterar e excluir (`POST`, `PUT`, `PATCH`, `DELETE`) exigem login. Sem token válido a resposta é `401`.

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "teste", "password": "teste123"}'
```

Resposta (`200`): `{"refresh": "...", "access": "..."}`. Use o `access` no cabeçalho `Authorization: Bearer <access>`. Para renovar:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh>"}'
```

No Swagger, use o botão **Authorize** e cole o `access`.

## Endpoints

Base: `/api/`. Todos os recursos têm as mesmas seis operações:

| Método | Rota | Ação | Sucesso |
|---|---|---|---|
| `GET` | `/api/{recurso}/` | lista paginada | `200` |
| `GET` | `/api/{recurso}/{id}/` | um item | `200` |
| `POST` | `/api/{recurso}/` | cria | `201` |
| `PUT` | `/api/{recurso}/{id}/` | atualização **completa** | `200` |
| `PATCH` | `/api/{recurso}/{id}/` | atualização parcial | `200` |
| `DELETE` | `/api/{recurso}/{id}/` | exclui | `204` |

`{recurso}` é `campeonatos`, `times`, `jogadores` ou `partidas`. Erros comuns: `400` (dado inválido), `401` (sem login), `404` (não encontrado).

### Corpos de exemplo (`POST` e `PUT`)

**Campeonato**

```json
{"nome": "Copa IFC", "modalidade": "Futsal", "data_inicio": "2026-12-01", "data_fim": "2026-12-20", "max_times": 8, "status": "inscricoes"}
```

**Time**

```json
{"nome": "Leoes do IFC", "sigla": "LEO", "cidade": "Araquari", "ano_fundacao": 1999, "descricao": "Time de futsal do IFC", "campeonato": 1}
```

**Jogador**

```json
{"nome": "Ze Gol", "numero_camisa": 10, "posicao": "Pivo", "time": 1}
```

**Partida** (nasce `agendada`, sem placar)

```json
{"campeonato": 1, "mandante": 1, "visitante": 2, "data_hora": "2026-12-05T15:00:00Z"}
```

Como o `PUT` é completo, ele exige todos os campos do recurso. Na partida, inclua também `status`, `gols_mandante` e `gols_visitante`.

### Rotas extras

**`POST /api/partidas/{id}/registrar-placar/`** (exige login). Corpo: `{"gols_mandante": 3, "gols_visitante": 1}`. Finaliza a partida e devolve a partida atualizada (`200`). Gols negativos: `400`. Partida já finalizada: `409`.

**`GET /api/campeonatos/{id}/classificacao/`** (público). Lista sem paginação, já ordenada:

```json
[
  {"posicao": 1, "time": 1, "nome": "Leoes do IFC", "jogos": 1, "vitorias": 1, "empates": 0, "derrotas": 0, "gols_pro": 3, "gols_contra": 1, "saldo": 2, "pontos": 3}
]
```

### Resposta de listas

```json
{"page": 1, "page_size": 10, "total_pages": 2, "results": []}
```

## Filtro, busca, ordenação e paginação

Valem para as listas `GET /api/{recurso}/`. Os parâmetros se combinam.

| Recurso | Filtros | Busca (`?search=`) | Ordenação (`?ordering=`) |
|---|---|---|---|
| campeonatos | `status`, `modalidade` | nome, modalidade | `nome`, `data_inicio`, `data_fim`, `max_times` |
| times | `campeonato`, `cidade`, `ano_fundacao` | nome, sigla, cidade, descrição | `nome`, `sigla`, `cidade`, `ano_fundacao` |
| jogadores | `time`, `time__campeonato`, `posicao` | nome, posição | `nome`, `numero_camisa` |
| partidas | `campeonato`, `status`, `time` (mandante ou visitante), `data_de`, `data_ate` | nome dos times | `data_hora`, `status` |

- **Ordenação:** use `-` para decrescente, por exemplo `?ordering=-data_hora`.
- **Busca:** parcial e sem diferenciar maiúsculas de minúsculas.
- **Datas:** `data_de` e `data_ate` aceitam data e hora (`2026-12-01` ou `2026-12-01T23:59:59`).
- **Paginação:** `?page=` (a partir de 1) e `?page_size=` (padrão 10, máximo 100). Página além da última devolve `200` com `results` vazio; `page_size` acima de 100 ou `page` menor que 1 devolvem `400`.

Exemplos:

```text
GET /api/times/?campeonato=1&search=leoes&ordering=nome
GET /api/partidas/?time=3&status=agendada&ordering=data_hora&page=1&page_size=5
GET /api/campeonatos/?status=inscricoes&search=copa
```

## Validações e erros

Respostas de erro são JSON, com a mensagem por campo (as mensagens padrão saem em português):

```json
{"data_fim": ["A data final não pode ser anterior à inicial."]}
```

Erros que não são de um campo único vêm em `non_field_errors` ou `detail`.

| Regra | Onde |
|---|---|
| Nome com pelo menos 2 caracteres | campeonato, time |
| `max_times` de pelo menos 2 | campeonato |
| `data_fim` não anterior a `data_inicio` | campeonato |
| Cidade de 2 a 50 caracteres; ano de fundação entre 1850 e o ano atual; descrição até 500 caracteres | time |
| Camisa entre 1 e 99 | jogador |
| Nome de time único por campeonato; camisa única por time | time, jogador |
| Regras de negócio 1 a 4 da seção de domínio | time, partida |

## Frontend

Pasta [frontend/](frontend/) (detalhes em [frontend/README.md](frontend/README.md)).

| Rota | O que faz |
|---|---|
| `/campeonatos` | lista com busca, filtro por status, ordenação e paginação; criar, editar e excluir |
| `/campeonatos/{id}/classificacao` | tabela de classificação |
| `/times`, `/jogadores` | lista com busca, filtros, ordenação e paginação; criar, editar e excluir |
| `/partidas` | lista com filtros (campeonato, time, status, período); criar, editar, excluir e registrar placar |
| `/login` | login com JWT (renovação automática do token) |

Leitura é pública; criar, editar, excluir e registrar placar exigem login. Erros da API aparecem junto dos campos. O horário das partidas é exibido em UTC, como a API devolve.

## Testes

```bash
uv run python manage.py test      # backend: 16 testes (regras, autenticação, consulta, classificação, Swagger)
cd frontend && npm run lint && npm run build
```

## Estrutura do projeto

```text
.
├── manage.py
├── pyproject.toml / uv.lock      dependências do backend
├── config/                       configurações e rotas do Django
├── campeonatos/                  app: models, serializers, views, filtros, paginação, testes
│   └── migrations/
└── frontend/                     app Next.js
    ├── app/                      rotas (cada pasta é uma URL)
    ├── components/               formulários, lista, menu
    └── lib/                      cliente da API e hooks
```

## Publicação

Ainda não publicada. As URLs da API e do frontend serão registradas aqui quando a publicação for feita.

---

# Histórico dos passos

Registro do desenvolvimento, na ordem em que foi feito (seguindo as Aulas 17 a 26 do curso).

---

## Passo 1: criar o projeto

### 1.1 Iniciar o projeto Python

```bash
uv init --bare
```

Cria o `pyproject.toml`, a "ficha" do projeto (nome, versão do Python e lista de
bibliotecas). É o equivalente ao `package.json` do JavaScript. O `--bare` cria só o
essencial.

### 1.2 Instalar as bibliotecas

```bash
uv add django djangorestframework
```

- **django:** o framework principal (banco de dados, rotas, painel de administração).
- **djangorestframework:** extensão do Django para criar APIs que respondem em JSON.
- O `uv` cria a pasta `.venv` (ambiente virtual: as bibliotecas ficam isoladas neste
  projeto), registra as dependências no `pyproject.toml` e as versões exatas no
  `uv.lock`.

### 1.3 Criar o projeto Django

```bash
uv run django-admin startproject config .
```

- `uv run` executa o comando dentro do ambiente do projeto (`.venv`).
- `config` é o nome da pasta de configurações; o `.` final cria os arquivos na pasta
  atual, sem uma pasta extra.

### 1.4 Criar o app

```bash
uv run python manage.py startapp campeonatos
```

O **projeto** (`config`) guarda as configurações; o **app** (`campeonatos`) guarda as
funcionalidades do domínio (models, serializers, views). Um projeto pode ter vários
apps.

### 1.5 Subir o servidor

```bash
uv run python manage.py runserver
```

Abra http://127.0.0.1:8000/ : a página do foguete confirma que a instalação
funcionou. `Ctrl+C` para parar. O aviso sobre "unapplied migrations" é esperado e
será resolvido no passo 2.

### Estrutura criada

| Arquivo / pasta | Para que serve |
|---|---|
| `manage.py` | Comando principal do Django (rodar servidor, migrations, etc.) |
| `config/settings.py` | Todas as configurações (apps instalados, banco, idioma) |
| `config/urls.py` | Mapa de rotas: qual URL chama qual código |
| `campeonatos/models.py` | Tabelas do banco, escritas como classes Python (passo 2) |
| `campeonatos/views.py` | Lógica que responde às requisições (passo 4) |
| `campeonatos/admin.py` | Registro dos models no painel de administração (passo 3) |
| `pyproject.toml` / `uv.lock` | Dependências do projeto e suas versões exatas |
| `.gitignore` | O que o Git não deve versionar (`.venv`, `.env`, banco local) |

---

## Passo 2: models e migrations

Models em `campeonatos/models.py`:

| Model | Campos principais |
|---|---|
| `Campeonato` | `nome`, `modalidade`, `data_inicio`, `data_fim`, `max_times`, `status` |
| `Time` | `nome`, `sigla`, `campeonato` (FK); nome único por campeonato |
| `Jogador` | `nome`, `numero_camisa`, `posicao`, `time` (FK); camisa única por time |
| `Partida` | `campeonato`, `mandante`, `visitante` (FKs), `data_hora`, `status`, `gols_mandante`, `gols_visitante` |

```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
```

Gera `campeonatos/migrations/0001_initial.py` e cria as tabelas no `db.sqlite3`.

---

## Passo 3: Django Admin

Os 4 models foram registrados em `campeonatos/admin.py`, com colunas, filtros e busca.

Painel: http://127.0.0.1:8000/admin/ (rode `uv run python manage.py runserver`).

Superusuário de desenvolvimento (só no `db.sqlite3` local, que não vai para o Git):
`admin` / `admin123`. Para criar o seu: `uv run python manage.py createsuperuser`.

---

## Passo 4: API REST com Django REST Framework

- `rest_framework` adicionado a `INSTALLED_APPS`.
- `campeonatos/serializers.py`: um `ModelSerializer` por model (converte objeto em JSON e valida a entrada).
- `campeonatos/views.py`: uma `ModelViewSet` por model (lista, detalhe, criação, `PUT`, `PATCH` e `DELETE`).
- `config/urls.py`: `DefaultRouter` gera as rotas abaixo.

| Recurso | Rotas |
|---|---|
| Campeonatos | `/api/campeonatos/` e `/api/campeonatos/{id}/` |
| Times | `/api/times/` e `/api/times/{id}/` |
| Jogadores | `/api/jogadores/` e `/api/jogadores/{id}/` |
| Partidas | `/api/partidas/` e `/api/partidas/{id}/` |

Em cada recurso: `GET` (lista), `POST`, `GET` (item), `PUT`, `PATCH`, `DELETE`.

Códigos: `200` leitura/atualização, `201` criação, `204` exclusão, `400` dado inválido
(inclui nome de time repetido no campeonato), `404` não encontrado.

---

## Passo 5: Swagger, validações e regras de negócio

- Documentação: `drf-spectacular`. Swagger em `/api/docs/`, Redoc em `/api/redoc/`, schema em `/api/schema/`.
- Validações nos serializers (resposta `400`): nome com no mínimo 2 caracteres, `max_times` >= 2, `data_fim` >= `data_inicio`, camisa entre 1 e 99.

**Regras de negócio**

1. Só é possível cadastrar time se o campeonato estiver em `inscricoes` e ainda houver vaga (`max_times`).
2. Partida: mandante diferente de visitante, e os dois times pertencem ao campeonato da partida.
3. Um time não pode ter duas partidas no mesmo horário.
4. Partida agendada não tem placar; finalizada exige placar completo e não aceita novo placar.
5. `POST /api/partidas/{id}/registrar-placar/` com `{"gols_mandante": 2, "gols_visitante": 1}` finaliza a partida (`200`); se já finalizada, retorna `409`.

Testes automatizados: `uv run python manage.py test`.

---

## Passo 6: filtro, busca, ordenação e paginação

Valem para todas as listas (`GET /api/campeonatos/`, `/times/`, `/jogadores/`, `/partidas/`).

| Recurso | Filtros | Busca (`?search=`) | Ordenação (`?ordering=`, use `-` para decrescente) |
|---|---|---|---|
| campeonatos | `status`, `modalidade` | nome, modalidade | nome, data_inicio, data_fim, max_times |
| times | `campeonato` | nome, sigla | nome, sigla |
| jogadores | `time`, `time__campeonato`, `posicao` | nome, posicao | nome, numero_camisa |
| partidas | `campeonato`, `status`, `time` (mandante ou visitante), `data_de`, `data_ate` | nome dos times | data_hora, status |

Paginação: `?page=` e `?page_size=` (padrão 10, máximo 100). Resposta:

```json
{ "page": 1, "page_size": 10, "total_pages": 2, "results": [] }
```

Página além da última retorna `200` com `results` vazio; `page_size` acima de 100 ou `page` menor que 1 retornam `400`.

Exemplo combinado: `/api/partidas/?time=3&status=agendada&ordering=data_hora&page=1&page_size=5`

---

## Passo 7: autenticação JWT (requisito opcional 9)

- `GET` é público; `POST`, `PUT`, `PATCH` e `DELETE` exigem login (sem token: `401`).
- Login: `POST /api/auth/token/` com `{"username": "...", "password": "..."}` retorna `access` e `refresh`.
- Renovar: `POST /api/auth/token/refresh/` com `{"refresh": "..."}`.
- Usar: cabeçalho `Authorization: Bearer <access>`. No Swagger (`/api/docs/`), botão **Authorize**.
- Usuário de teste (somente desenvolvimento): `teste` / `teste123`.

---

## Passo 8: evoluindo o Time (exercício da Aula 26)

Três campos novos em `Time`, atravessando model, migration, serializer, validação, filtro, ordenação, busca e Swagger:

| Campo | Regra | Filtro | Ordenação | Busca |
|---|---|---|---|---|
| `cidade` | obrigatório, 2 a 50 caracteres | exato | sim | sim |
| `ano_fundacao` | opcional, entre 1850 e o ano atual | exato | sim | não (numérico) |
| `descricao` | opcional, máximo 500 caracteres | não | não | sim |

Migration `0002_time_ano_fundacao_time_cidade_time_descricao`. Times já existentes ficam com cidade `"Não informada"`.

Exemplos: `/api/times/?cidade=Araquari`, `/api/times/?search=futsal&ordering=-ano_fundacao`.

---

## Passo 9: classificação

`GET /api/campeonatos/{id}/classificacao/` devolve a tabela do campeonato (vitória 3 pontos, empate 1), considerando só partidas finalizadas. Cada linha traz `posicao`, `time`, `nome`, `jogos`, `vitorias`, `empates`, `derrotas`, `gols_pro`, `gols_contra`, `saldo` e `pontos`. Desempate: pontos, saldo de gols, gols pró e nome. Times sem jogos aparecem com zeros.

---

## Passo 10: frontend, etapa F1 (Next.js)

Pasta `frontend/` (Next.js 16, TypeScript, Tailwind). O backend ganhou `django-cors-headers`; a origem do front é definida em `CORS_ALLOWED_ORIGINS` (padrão `http://localhost:3000`).

Entregue nesta etapa: layout e navegação, login/logout com JWT (renovação automática do token), e **campeonatos completo**: lista com busca, filtro por status, ordenação e paginação; criar, editar (`PUT`) e excluir; erros da API exibidos junto dos campos.

Rodar (com a API em `localhost:8000`):

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

A URL da API vem de `NEXT_PUBLIC_API_URL` (padrão `http://localhost:8000/api`).

---

## Passo 11: frontend, etapa F2 (Times e Jogadores)

- Telas de **Times** (`/times`) e **Jogadores** (`/jogadores`): lista com busca, filtro (por campeonato ou por time), ordenação e paginação; criar, editar (`PUT`) e excluir.
- Os formulários trazem selects de campeonato/time carregados da API e os campos novos do time (`cidade`, `ano_fundacao`, `descricao`). Erros de validação e de regra de negócio (vaga, inscrições encerradas, camisa repetida) aparecem junto do campo.
- O código das listas e formulários foi extraído em peças reutilizáveis (`useLista`, `useFormulario`, `Resultados`, `Campo`), e os campeonatos passaram a usá-las.
- API: `LANGUAGE_CODE = "pt-br"`, então as mensagens padrão de erro do DRF saem em português.

---

## Passo 12: frontend, etapa F3 (Partidas e classificação)

- **Partidas** (`/partidas`): lista com busca pelo nome dos times; filtros por campeonato, time (mandante ou visitante), status e período; ordenação e paginação; criar, editar e excluir.
- No formulário, os times disponíveis dependem do campeonato escolhido. Regras da API (mesmo time dos dois lados, time de outro campeonato, conflito de horário) aparecem na tela.
- **Registrar placar** direto na lista, em partidas agendadas (`POST /api/partidas/{id}/registrar-placar/`); a partida passa a finalizada e o placar não muda mais.
- **Classificação** (`/campeonatos/{id}/classificacao`): tabela com pontos, jogos, vitórias, empates, derrotas, gols e saldo, acessível pelo botão em cada campeonato.
- O horário é exibido como a API devolve (UTC), sem conversão de fuso.

---

## Passo 13: frontend, etapa F4 (acabamento e acessibilidade)

- Título de aba por página ("Novo time · Campeonatos"), link "Pular para o conteúdo", `aria-current` no menu e `color-scheme` para tema claro e escuro.
- Erros de campo ligados ao campo (`aria-describedby` e `aria-invalid`) e botões com o nome do item ("Editar Leoes do IFC").
- Datas formatadas com `Intl`.
- README próprio do frontend em `frontend/README.md`.
