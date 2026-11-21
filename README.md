# Bit - Assistente de Suporte de TI

## Apresentacao visual

Veja a interface, o GIF animado e os principais fluxos para avaliadores em [APRESENTACAO.md](./APRESENTACAO.md).

## GIFs para LinkedIn

Para publicar o projeto nas redes profissionais, consulte [LINKEDIN.md](./LINKEDIN.md). O arquivo inclui tres GIFs separados da interface inicial, da pergunta e da resposta fundamentada.

Assistente RAG para suporte de TI, com base de conhecimento em ChromaDB e LLM via OpenRouter.

## Estrutura do projeto

```
agenteia/
├── docs/                  # Base de conhecimento (100+ arquivos .md)
├── src/                   # Frontend React + TypeScript
│   ├── pages/Index.tsx    # Interface de chat
│   └── components/ui/     # Componentes shadcn/ui
├── servidor.py            # Backend FastAPI (RAG)
├── indexar.py             # Indexa os .md no ChromaDB
├── responder.py           # CLI do assistente (terminal)
├── buscar.py              # Busca similaridade (CLI)
├── requirements.txt       # Dependências Python
├── package.json           # Dependências Node/React
└── .env                   # Chaves de API
```

## Como rodar

### 1. Instalar dependências Python (uma vez só)

```bash
venv313\Scripts\python.exe -m pip install -r requirements.txt
```

Ou dê duplo clique em `iniciar_backend.bat` (instala e já sobe o servidor).

### 2. Indexar a base de conhecimento (uma vez só, ou depois de adicionar docs)

```bash
venv313\Scripts\python.exe indexar.py
```

### 3. Rodar o backend (API)

```bash
venv313\Scripts\uvicorn.exe servidor:app --reload --port 8000
```

Ou dê duplo clique em `iniciar_backend.bat`.

### 4. Rodar o frontend (React)

Em outro terminal:

```bash
pnpm dev
```

Abra http://localhost:5173 no navegador.

## Testando

1. Rode o backend (passo 3)
2. Rode o frontend (passo 4)
3. No navegador, digite uma pergunta como "Computador não liga" ou "VPN não conecta"
4. O Bit vai responder com base nos documentos da pasta `docs/`

## Variáveis de ambiente (.env)

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-3.5-turbo
```

## Endpoints da API

- `GET /api/health` - Verifica se o servidor está no ar
- `POST /api/chat` - Envia pergunta e recebe resposta
  - Body: `{"pergunta": "sua pergunta"}`
  - Response: `{"resposta": "...", "fontes": ["arquivo.md"]}`