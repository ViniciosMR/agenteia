"""API HTTP do Bit - assistente de suporte de TI.

Expõe o RAG (ChromaDB + embeddings + OpenRouter) para o frontend React.

Como rodar:
    uvicorn servidor:app --reload --port 8000
"""

import os

import chromadb
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

load_dotenv()

PASTA_BANCO = "chroma_db"
COLECAO = "suporte_ti"
MODELO_EMBEDDING = "paraphrase-multilingual-MiniLM-L12-v2"

N_TRECHOS = 3
SIMILARIDADE_MINIMA = 0.30

SYSTEM_PROMPT = """Você é o Bit, um assistente de suporte de TI simpático e objetivo.

Regras:
- Responda SOMENTE com base nos trechos de documentação fornecidos.
- Se os trechos não trouxerem a resposta para a pergunta, responda apenas com a palavra \
NAO_ENCONTRADO, sem mais nada.
- Nunca invente passos, comandos, prazos ou links que não estejam nos trechos.
- Responda em português, de forma clara. Use passos numerados quando for um procedimento.
- Não cite nomes de arquivos: as fontes são adicionadas automaticamente pelo sistema."""

MENSAGEM_SEM_RESULTADO = (
    "Não encontrei isso na base de conhecimento. "
    "Recomendo abrir um chamado descrevendo o problema com o máximo de detalhes."
)

app = FastAPI(title="Bit - Suporte de TI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carregados uma única vez na inicialização.
modelo_embedding = SentenceTransformer(MODELO_EMBEDDING)
colecao = chromadb.PersistentClient(path=PASTA_BANCO).get_collection(COLECAO)

chave = os.getenv("OPENROUTER_API_KEY")
modelo_llm = os.getenv("OPENROUTER_MODEL")
cliente_llm = (
    OpenAI(base_url="https://openrouter.ai/api/v1", api_key=chave) if chave else None
)


class Pergunta(BaseModel):
    pergunta: str


def buscar_trechos(pergunta):
    embedding = modelo_embedding.encode([pergunta]).tolist()
    resultado = colecao.query(query_embeddings=embedding, n_results=N_TRECHOS)

    trechos = []
    for texto, meta, dist in zip(
        resultado["documents"][0],
        resultado["metadatas"][0],
        resultado["distances"][0],
    ):
        similaridade = 1 - dist
        if similaridade >= SIMILARIDADE_MINIMA:
            trechos.append(
                {"texto": texto, "fonte": meta["fonte"], "similaridade": similaridade}
            )
    return trechos


def gerar_resposta(pergunta, trechos):
    contexto = "\n\n---\n\n".join(
        f"[Trecho do documento {t['fonte']}]\n{t['texto']}" for t in trechos
    )
    resposta = cliente_llm.chat.completions.create(
        model=modelo_llm,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Trechos da documentação:\n\n{contexto}\n\n"
                    f"Pergunta do usuário: {pergunta}"
                ),
            },
        ],
    )
    return resposta.choices[0].message.content


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "llm_configurado": cliente_llm is not None,
        "modelo": modelo_llm,
    }


@app.post("/api/chat")
def chat(payload: Pergunta):
    pergunta = payload.pergunta.strip()
    if not pergunta:
        return {"resposta": "Digite uma pergunta.", "fontes": []}

    trechos = buscar_trechos(pergunta)
    if not trechos:
        return {"resposta": MENSAGEM_SEM_RESULTADO, "fontes": []}

    if cliente_llm is None:
        return {
            "resposta": "Faltou configurar OPENROUTER_API_KEY e OPENROUTER_MODEL no arquivo .env",
            "fontes": [],
        }

    try:
        resposta = gerar_resposta(pergunta, trechos)
    except Exception as erro:
        return {
            "resposta": f"Erro ao chamar o modelo: {erro}. Confira a chave e o modelo no .env.",
            "fontes": [],
        }

    if "NAO_ENCONTRADO" in resposta:
        return {"resposta": MENSAGEM_SEM_RESULTADO, "fontes": []}

    fontes = sorted({t["fonte"] for t in trechos})
    return {"resposta": resposta, "fontes": fontes}
