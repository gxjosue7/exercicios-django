# API de Campeonatos

Projeto final de Desenvolvimento Web II (BSI, IFC Araquari): uma API REST para
gerenciar campeonatos, times, jogadores e partidas, feita com Django + Django REST
Framework.

> Este README é construído passo a passo. Cada passo abaixo explica o que foi feito
> e por quê.

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
