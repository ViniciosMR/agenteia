import chromadb
from sentence_transformers import SentenceTransformer

PASTA_BANCO = "chroma_db"
COLECAO = "suporte_ti"
MODELO = "paraphrase-multilingual-MiniLM-L12-v2"


def main():
    modelo = SentenceTransformer(MODELO)
    cliente = chromadb.PersistentClient(path=PASTA_BANCO)
    colecao = cliente.get_collection(COLECAO)

    print("Digite sua pergunta (ou 'sair' para encerrar).")
    while True:
        pergunta = input("\nPergunta: ").strip()
        if pergunta.lower() in ("sair", "exit", ""):
            break

        embedding = modelo.encode([pergunta]).tolist()
        resultado = colecao.query(query_embeddings=embedding, n_results=3)

        for doc, meta, dist in zip(
            resultado["documents"][0],
            resultado["metadatas"][0],
            resultado["distances"][0],
        ):
            similaridade = 1 - dist
            print(f"\n[{similaridade:.2f}] {meta['fonte']} | {meta['secao']}")
            print(doc[:200].replace("\n", " ") + "...")


if __name__ == "__main__":
    main()
