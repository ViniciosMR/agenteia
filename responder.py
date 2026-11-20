import os

import chromadb
from dotenv import load_dotenv
from openai import OpenAI
from sentence_transformers import SentenceTransformer

load_dotenv()

PASTA_BANCO = "chroma_db"
COLECAO = "suporte_ti"
MODELO_EMBEDDING = "paraphrase-multilingual-MiniLM-L12-v2"

N_TRECHOS = 3
# Abaixo dessa similaridade, o trecho é considerado irrelevante.
# Ajuste olhando as notas que o buscar.py mostra para perguntas boas e ruins.
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


def buscar_trechos(pergunta, modelo_embedding, colecao):
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


def gerar_resposta(pergunta, trechos, cliente_llm, modelo_llm):
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


def main():
    chave = os.getenv("OPENROUTER_API_KEY")
    modelo_llm = os.getenv("OPENROUTER_MODEL")
    if not chave or not modelo_llm:
        print("Faltou configurar OPENROUTER_API_KEY e OPENROUTER_MODEL no arquivo .env")
        return

    cliente_llm = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=chave)
    modelo_embedding = SentenceTransformer(MODELO_EMBEDDING)
    colecao = chromadb.PersistentClient(path=PASTA_BANCO).get_collection(COLECAO)

    print("Bit: Olá! Sou o assistente de suporte de TI. (digite 'sair' para encerrar)")
    while True:
        pergunta = input("\nVocê: ").strip()
        if pergunta.lower() in ("sair", "exit", ""):
            break

        trechos = buscar_trechos(pergunta, modelo_embedding, colecao)
        if not trechos:
            print(f"\nBit: {MENSAGEM_SEM_RESULTADO}")
            continue

        try:
            resposta = gerar_resposta(pergunta, trechos, cliente_llm, modelo_llm)
        except Exception as erro:
            print(f"\nErro ao chamar o modelo: {erro}")
            print("Confira a chave e o nome do modelo no .env.")
            continue

        if "NAO_ENCONTRADO" in resposta:
            print(f"\nBit: {MENSAGEM_SEM_RESULTADO}")
            continue

        fontes = sorted({t["fonte"] for t in trechos})
        print(f"\nBit: {resposta}")
        print(f"\nFontes: {', '.join(fontes)}")


if __name__ == "__main__":
    main()
