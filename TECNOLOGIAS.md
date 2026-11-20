# Tecnologias do projeto

## Visao geral

O Bit e um assistente de suporte de TI baseado em RAG (Retrieval-Augmented Generation). Ele consulta uma base de conhecimento local em Markdown, recupera os trechos mais relevantes e envia o contexto a um modelo de linguagem por meio da OpenRouter.

## Frontend

- **React 18**: construcao da interface de usuario.
- **TypeScript**: tipagem estatica do codigo frontend.
- **Vite 5**: servidor de desenvolvimento e empacotamento da aplicacao.
- **React Router**: navegacao entre paginas da aplicacao.
- **Tailwind CSS**: estilizacao utilitaria.
- **Radix UI e shadcn/ui**: componentes acessiveis e reutilizaveis.
- **Lucide React**: icones da interface.
- **Sonner**: notificacoes visuais.
- **pnpm**: gerenciamento das dependencias e execucao do workspace frontend.

## Backend

- **Python 3**: linguagem principal da indexacao e da API.
- **FastAPI**: exposicao dos endpoints HTTP do assistente.
- **Uvicorn**: servidor ASGI para executar a aplicacao FastAPI.
- **Pydantic**: validacao dos dados recebidos pela API.
- **python-dotenv**: carregamento das configuracoes a partir de variaveis de ambiente.
- **OpenAI Python SDK**: integracao compativel com a API da OpenRouter.

## RAG e inteligencia artificial

- **ChromaDB**: banco vetorial persistente usado para armazenar os trechos indexados.
- **Sentence Transformers**: geracao dos embeddings semanticos.
- **Modelo paraphrase-multilingual-MiniLM-L12-v2**: embeddings multilíngues usados nas buscas em portugues.
- **OpenRouter**: roteamento das requisicoes para o modelo de linguagem configurado.
- **Arquivos Markdown**: conteudo da base de conhecimento do suporte de TI.

## Estrutura de funcionamento

1. Os documentos da pasta `docs/` sao divididos em secoes.
2. O script `indexar.py` gera embeddings com Sentence Transformers.
3. Os embeddings e metadados sao gravados no ChromaDB.
4. A API recebe uma pergunta pelo endpoint `/api/chat`.
5. Os trechos mais semelhantes sao recuperados no banco vetorial.
6. A pergunta e os trechos sao enviados ao modelo configurado na OpenRouter.
7. A resposta e os nomes dos documentos utilizados sao devolvidos ao frontend.

## Configuracao local

As credenciais nao sao versionadas. Crie um arquivo `.env` a partir de `.env.example` e configure:

```dotenv
OPENROUTER_API_KEY=sua_chave_da_openrouter
OPENROUTER_MODEL=modelo_disponivel_na_openrouter
```

As dependencias Python ficam em `requirements.txt`, e as dependencias frontend ficam em `package.json` com o lockfile `pnpm-lock.yaml`.
