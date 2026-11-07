# django-bsi4

Exercício de Desenvolvimento Web II (BSI, IFC Araquari): API REST de **produtos** com Django e Django REST Framework, construída seguindo a Parte 7 (Aulas 17 a 26) do material do professor: https://github.com/marrcandre/desweb2

O projeto é construído por aulas. Cada seção abaixo registra o que foi feito e como rodar.

## Pré-requisitos

- Python 3.14 ou superior
- [uv](https://docs.astral.sh/uv/)

## Aula 17: projeto inicial

```bash
uv init --app --no-package --python 3.14 .
uv add django
uv run django-admin startproject config .
uv run python manage.py startapp produtos
```

O app `produtos` foi acrescentado a `INSTALLED_APPS` em `config/settings.py`.

Rodar:

```bash
uv run python manage.py runserver
```

Abra http://127.0.0.1:8000/ : a página "The install worked successfully!" confirma o projeto.

Estrutura:

```text
.
├── manage.py
├── pyproject.toml
├── uv.lock
├── config/
└── produtos/
```

## Aula 18: model, SQLite e migrations

Model `Produto` em `produtos/models.py` (`nome` e `preco`; o `id` é automático).

```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py showmigrations
uv run python manage.py check
```

Carga dos dados iniciais (60 produtos), baixados do material do professor:

```bash
curl -L https://raw.githubusercontent.com/marrcandre/desweb2/main/produtos/produtos.json -o produtos.json
uv run python manage.py loaddata produtos.json
```

O banco é o `db.sqlite3` (ignorado pelo Git); quem clonar o projeto roda `migrate` e `loaddata`.
