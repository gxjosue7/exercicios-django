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

## Aula 19: Django Admin

`ProdutoAdmin` em `produtos/admin.py`: colunas `id`, `nome` e `preco`, e busca pelo nome.

```bash
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

Acesse http://127.0.0.1:8000/admin/ para cadastrar, editar, pesquisar e excluir produtos. O Admin e a futura API usam o mesmo model e o mesmo banco.

Usuário de desenvolvimento deste banco local: `admin` / `admin123`.

## Aula 20: primeiro endpoint com Django REST Framework

```bash
uv add djangorestframework
```

`rest_framework` entrou em `INSTALLED_APPS`. Camadas:

```text
Model → ModelSerializer → ModelViewSet → DefaultRouter → endpoint REST
```

- `produtos/serializers.py`: `ProdutoSerializer` (`id`, `nome`, `preco`).
- `produtos/views.py`: `ProdutoViewSet`, com listagem, detalhe, criação, `PUT`, `PATCH` e exclusão.
- `config/urls.py`: `DefaultRouter` registra `produtos` em `/api/`.

Rotas:

```text
GET    /api/produtos/
GET    /api/produtos/{id}/
POST   /api/produtos/
PUT    /api/produtos/{id}/
PATCH  /api/produtos/{id}/
DELETE /api/produtos/{id}/
```

Testar no navegador (interface navegável do DRF) em http://127.0.0.1:8000/api/produtos/.

## Aula 21: OpenAPI e Swagger

```bash
uv add drf-spectacular
```

`drf_spectacular` entrou em `INSTALLED_APPS`; `config/settings.py` ganhou `DEFAULT_SCHEMA_CLASS` em `REST_FRAMEWORK` e `SPECTACULAR_SETTINGS` (título, descrição e versão). As rotas foram acrescentadas em `config/urls.py`.

| O quê | Endereço |
|---|---|
| Schema OpenAPI | http://127.0.0.1:8000/api/schema/ |
| Swagger UI | http://127.0.0.1:8000/api/docs/ |
| Redoc | http://127.0.0.1:8000/api/redoc/ |

O Swagger documenta o CRUD criado na Aula 20; nenhuma ViewSet foi alterada.
