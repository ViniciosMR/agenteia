# AI Rules for This App

## Tech Stack (5-10 bullet points)

- **Python Backend**: Core RAG assistant for IT support with ChromaDB vector storage, Sentence Transformers for embeddings, and OpenAI/OpenRouter for LLM responses.
- **React Frontend**: TypeScript-based web UI with React Router for navigation, shadcn/ui components, and Tailwind CSS for styling.
- **Integration**: The React app calls the Python backend via API endpoints to provide a chat interface for IT support queries.
- **Environment**: Uses dotenv for configuration, with OpenRouter API key and model settings.
- **Vector Database**: ChromaDB for persistent storage of document embeddings and retrieval.
- **Embeddings**: Uses paraphrase-multilingual-MiniLM-L12-v2 model for multilingual text embeddings.
- **LLM**: OpenRouter API for accessing various language models with temperature control.
- **Documentation**: Markdown files in docs/ serve as the knowledge base for IT support queries.
- **Development**: Uses pnpm for package management, with hot reload for development.
- **Styling**: Tailwind CSS for utility-first styling, integrated with shadcn/ui component library.

## Library Usage Rules

### Backend (Python)
- **chromadb**: Use for vector database operations. Store document embeddings and retrieve relevant chunks.
- **sentence-transformers**: Use for generating text embeddings. Use paraphrase-multilingual-MiniLM-L12-v2 model.
- **openai**: Use for LLM API calls. Configure with OpenRouter base URL and API key.
- **dotenv**: Use for environment variable management. Required for API keys and model settings.
- **chromadb**: Use for persistent vector storage. Store in chroma_db/ directory.

### Frontend (React/TypeScript)
- **React Router**: Use for client-side routing. Keep routes in src/App.tsx.
- **shadcn/ui**: Use for UI components. Import prebuilt components, don't edit their source files.
- **Tailwind CSS**: Use for styling. Apply utility classes extensively for layout and design.
- **Lucide React**: Use for icons. Import icons from lucide-react package.
- **Radix UI**: Use for accessible components where needed.

### Integration Rules
- **API Communication**: The React frontend calls Python backend via HTTP endpoints. Use fetch or axios for API calls.
- **State Management**: Use React state management for chat history and UI state.
- **Error Handling**: Handle API errors gracefully in the frontend. Show user-friendly error messages.
- **Loading States**: Show loading indicators during API calls and embedding generation.
- **Responsive Design**: Ensure the UI works well on both desktop and mobile devices.

## Development Guidelines

- **File Structure**: Keep source code in src/ folder. Pages in src/pages/, components in src/components/.
- **Main Page**: src/pages/Index.tsx is the default page. Update it to include new components.
- **Component Library**: Use shadcn/ui components. Don't edit their source files, create new components if modifications are needed.
- **Styling**: Use Tailwind CSS classes for all styling needs. Avoid custom CSS files where possible.
- **TypeScript**: Use strict TypeScript configuration. Type all components and API responses.
- **Code Quality**: Keep code simple and focused. Avoid over-engineering. Only make changes directly requested.
- **Testing**: Write tests for critical functionality. Use testing library where appropriate.
- **Deployment**: Ensure both backend and frontend are properly configured for production deployment.