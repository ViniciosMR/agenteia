"""Instala as dependências Python no venv313."""

import subprocess
import sys

DEPENDENCIAS = [
    "chromadb>=0.4.0",
    "sentence-transformers>=2.2.0",
    "openai>=1.0.0",
    "python-dotenv>=1.0.0",
    "fastapi>=0.104.0",
    "uvicorn>=0.24.0",
    "pydantic>=2.5.0",
]

def run(cmd):
    print(f"Executando: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

def main():
    # Ativa o venv
    python = "venv313/Scripts/python.exe"
    pip = [python, "-m", "pip", "install", "--upgrade", "pip"]
    run(pip)

    for pkg in DEPENDENCIAS:
        pip = [python, "-m", "pip", "install", pkg]
        run(pip)

    print("\n✅ Dependências instaladas com sucesso!")
    print("\nPara rodar o backend:")
    print("  uvicorn servidor:app --reload --port 8000")
    print("\nPara rodar o frontend:")
    print("  pnpm dev")

if __name__ == "__main__":
    main()