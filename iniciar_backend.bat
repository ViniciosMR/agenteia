@echo off
echo ========================================
echo  Bit - Instalando dependencias Python
echo ========================================

cd /d "%~dp0"

echo.
echo [1/3] Atualizando pip...
venv313\Scripts\python.exe -m pip install --upgrade pip

echo.
echo [2/3] Instalando dependencias...
venv313\Scripts\python.exe -m pip install chromadb sentence-transformers openai python-dotenv fastapi uvicorn pydantic

echo.
echo [3/3] Iniciando servidor FastAPI na porta 8000...
echo.
echo O servidor vai rodar em: http://localhost:8000
echo Deixe esta janela aberta e abra o navegador no frontend.
echo.
pause
venv313\Scripts\uvicorn.exe servidor:app --reload --port 8000