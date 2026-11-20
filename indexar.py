from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

PASTA_DOCS = Path("docs")
PASTA_BANCO = "chroma_db"
COLECAO = "suporte_ti"
MODELO = "paraphrase-multilingual-MiniLM-L12-v2"


def dividir_em_trechos(texto):
    """Divide um documento em trechos, um por seção (## ...).

    Cada trecho começa com "Título - Seção" para que o significado
    do documento acompanhe o trecho na hora da busca.
    """
    linhas = texto.splitlines()
    titulo = linhas[0].lstrip("# ").strip()

    trechos = []
    secao_atual = "Introdução"
    buffer = []

    def fechar_trecho():
        corpo = "\n".join(buffer).strip()
        if corpo:
            trechos.append(
                {"texto": f"{titulo} - {secao_atual}\n{corpo}", "secao": secao_atual}
            )

    for linha in linhas[1:]:
        if linha.startswith("## "):
            fechar_trecho()
            buffer.clear()
            secao_atual = linha[3:].strip()
        else:
            buffer.append(linha)
    fechar_trecho()

    return trechos


def main():
    arquivos = sorted(PASTA_DOCS.glob("*.md"))
    if not arquivos:
        print("Nenhum arquivo .md encontrado na pasta docs/")
        return

    print("Carregando modelo de embeddings...")
    modelo = SentenceTransformer(MODELO)

    cliente = chromadb.PersistentClient(path=PASTA_BANCO)
    try:
        cliente.delete_collection(COLECAO)  # recria do zero a cada execução
    except Exception:
        pass
    colecao = cliente.create_collection(
        name=COLECAO, metadata={"hnsw:space": "cosine"}
    )

    ids, textos, metadados = [], [], []
    for arquivo in arquivos:
        texto = arquivo.read_text(encoding="utf-8")
        for i, trecho in enumerate(dividir_em_trechos(texto)):
            ids.append(f"{arquivo.stem}-{i}")
            textos.append(trecho["texto"])
            metadados.append({"fonte": arquivo.name, "secao": trecho["secao"]})

    print(f"Gerando embeddings de {len(textos)} trechos...")
    embeddings = modelo.encode(textos).tolist()

    colecao.add(
        ids=ids, documents=textos, embeddings=embeddings, metadatas=metadados
    )
    print(f"Pronto: {len(arquivos)} documentos, {len(textos)} trechos indexados.")


if __name__ == "__main__":
    main()
