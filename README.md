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