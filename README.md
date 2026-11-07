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

## Aula 22: validações

Regras no `ProdutoSerializer` (`produtos/serializers.py`), aplicadas antes de salvar:

- `nome`: após remover espaços das pontas, pelo menos 2 caracteres (o valor limpo é o que fica salvo).
- `preco`: maior que zero, comparado como `Decimal` (sem converter para `float`).

Dados inválidos retornam `400 Bad Request` com a mensagem por campo, por exemplo `{"nome": ["O nome deve possuir pelo menos 2 caracteres."], "preco": ["O preço deve ser maior que zero."]}`. Dados válidos retornam `201 Created`.

Testes automatizados (começam nesta aula e crescem a cada uma):

```bash
uv run python manage.py test
```

## Aula 23: filtros

```bash
uv add django-filter
```

`django_filters` entrou em `INSTALLED_APPS` e `DjangoFilterBackend` em `DEFAULT_FILTER_BACKENDS`. Filtros em `produtos/filters.py` (`ProdutoFilter`), ligados à ViewSet por `filterset_class`:

| Parâmetro | Efeito |
|---|---|
| `preco_minimo` | `preco >= valor` |
| `preco_maximo` | `preco <= valor` |

```text
GET /api/produtos/?preco_minimo=100&preco_maximo=1000
GET /api/produtos/?preco_minimo=100
GET /api/produtos/?preco_maximo=1000
```

Valor não numérico retorna `400`. Os parâmetros aparecem no Swagger (`/api/docs/`).

## Aula 24: ordenação e busca textual

`ProdutoViewSet` agora usa `DjangoFilterBackend`, `SearchFilter` e `OrderingFilter`, com `ordering_fields = ("nome", "preco")`, `ordering = ("id",)` (ordem padrão) e `search_fields = ("nome",)`.

| Parâmetro | Efeito |
|---|---|
| `ordering=nome`, `-nome`, `preco`, `-preco` | ordenação (o `-` inverte) |
| `search=termo` | busca parcial, sem diferenciar maiúsculas, no nome |

```text
GET /api/produtos/?ordering=nome
GET /api/produtos/?ordering=-preco
GET /api/produtos/?search=mouse
GET /api/produtos/?preco_minimo=100&search=teclado&ordering=nome
```

Filtros, busca e ordenação se combinam no mesmo queryset.

## Aula 25: paginação

`ProdutoPagination` (`produtos/pagination.py`) estende o `PageNumberPagination` do DRF e mantém o contrato usado nas aulas de Express e FastAPI. Configuração global em `config/settings.py`: `DEFAULT_PAGINATION_CLASS` e `PAGE_SIZE = 10`.

```json
{ "page": 1, "page_size": 10, "total_pages": 6, "results": [] }
```

| Parâmetro | Padrão | Regra |
|---|---|---|
| `page` | 1 | inteiro a partir de 1; inválido ou menor que 1 retorna `400` |
| `page_size` | 10 | máximo 100; acima disso retorna `400` |

Página além da última retorna `200` com `results` vazio. Filtros, busca e ordenação são aplicados antes de paginar.

```text
GET /api/produtos/?page=1
GET /api/produtos/?page=2&page_size=20
GET /api/produtos/?search=mouse&ordering=-preco&page=1&page_size=5
GET /api/produtos/?page=999
```

O formato da resposta paginada também aparece documentado no Swagger.
