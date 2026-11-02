# API de Campeonatos

Projeto final de Desenvolvimento Web II (BSI, IFC Araquari): uma API REST para
gerenciar campeonatos, times, jogadores e partidas, feita com Django + Django REST
Framework.

## Domínio

Gerenciador de campeonatos esportivos.

| Entidade | Descrição |
|---|---|
| `Campeonato` | competição, com modalidade, datas, limite de times e status (`inscricoes`, `andamento`, `encerrado`) |
| `Time` | pertence a um campeonato; nome único por campeonato |
| `Jogador` | pertence a um time; camisa única por time |
| `Partida` | jogo entre dois times (mandante e visitante) do mesmo campeonato |

**Regras de negócio:** só entram times com inscrições abertas e vaga; mandante e visitante diferentes e do mesmo campeonato; um time não joga duas partidas no mesmo horário; partida agendada não tem placar e finalizada não aceita novo placar (`POST /api/partidas/{id}/registrar-placar/`).

## Instalação e execução

Requisitos: Python 3.14+ e [uv](https://docs.astral.sh/uv/).

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser   # usuário do Admin e da API
uv run python manage.py runserver
```

- API: http://127.0.0.1:8000/api/
- Swagger: http://127.0.0.1:8000/api/docs/ (Redoc em `/api/redoc/`)
- Admin: http://127.0.0.1:8000/admin/
- Testes: `uv run python manage.py test`

Banco: SQLite (`db.sqlite3`, criado pelo `migrate`; não vai para o Git).

Variáveis de ambiente (opcionais em desenvolvimento): `SECRET_KEY`, `DEBUG` (`1` ou `0`) e `ALLOWED_HOSTS` (separados por vírgula). Não há segredos no repositório.

## API

| Recurso | Rotas |
|---|---|
| Campeonatos | `/api/campeonatos/`, `/api/campeonatos/{id}/` |
| Times | `/api/times/`, `/api/times/{id}/` |
| Jogadores | `/api/jogadores/`, `/api/jogadores/{id}/` |
| Partidas | `/api/partidas/`, `/api/partidas/{id}/`, `POST /api/partidas/{id}/registrar-placar/` |

Em cada recurso: `GET` lista, `POST`, `GET` item, `PUT`, `PATCH`, `DELETE`. Corpos e respostas de cada operação estão no Swagger. Códigos: `200`, `201`, `204`, `400` (validação), `401` (sem login), `404`, `409` (placar já registrado).

Filtros, busca, ordenação e paginação: ver o **Passo 6** abaixo.

**Autenticação (JWT):** `GET` é público; as demais operações exigem `Authorization: Bearer <access>`. Obtenha o token em `POST /api/auth/token/` com `{"username", "password"}`. Usuário de teste local: veja o **Passo 7**; em outro ambiente, crie um com `createsuperuser`.

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
