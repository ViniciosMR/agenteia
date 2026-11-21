import { FormEvent, useState } from "react";
import {
  Bot,
  LayoutGrid,
  MessageSquare,
  Send,
  TicketCheck,
  TrendingUp,
  Loader2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  fontes?: string[];
  timestamp: Date;
}

const API_URL = "http://localhost:8000/api/chat";

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (question?: string) => {
    const pergunta = (question ?? input).trim();
    if (!pergunta) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: pergunta,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta }),
      });

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
      }

      const dados = await resposta.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: dados.resposta,
        fontes: dados.fontes ?? [],
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (erro) {
      toast.error("Não consegui falar com o servidor. Ele está rodando?");
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Erro de conexão com o backend. Verifique se o servidor Python está rodando.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleSend();
  };

  const perguntasRapidas = [
    "Computador nao liga",
    "Internet lenta",
    "VPN nao conecta",
    "Impressora offline",
    "Esqueci minha senha",
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Bot /></div>
          <div>
            <strong>Bit</strong>
            <span>Assistente de TI</span>
          </div>
        </div>

        <nav className="side-nav" aria-label="Menu principal">
          <button className="nav-item active" type="button">
            <MessageSquare />
            <span>Chat</span>
          </button>
          <button className="nav-item" type="button">
            <LayoutGrid />
            <span>Topicos</span>
          </button>
          <button className="nav-item" type="button">
            <TrendingUp />
            <span>Mais Buscados</span>
          </button>
        </nav>

        <button className="ticket-button" type="button">
          <TicketCheck />
          <span>Abrir Chamado</span>
        </button>
      </aside>

      <main className="chat-shell">
        <header className="chat-header">
          <div className="chat-brand">
            <div className="brand-icon small"><Bot /></div>
            <div>
              <strong>Bit</strong>
              <span>Assistente de Suporte de TI</span>
            </div>
          </div>
          <p>Olá! Sou o Bit. Digite sua pergunta abaixo e eu ajudarei você.</p>

          {messages.length === 0 && (
            <div className="quick-questions">
              <span className="quick-label">✨ Perguntas rápidas</span>
              <div className="quick-buttons">
                {perguntasRapidas.map((pergunta) => (
                  <button key={pergunta} type="button" onClick={() => void handleSend(pergunta)}>
                    {pergunta}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <section className="conversation" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-state">
              <Bot />
              <p>Faça sua primeira pergunta sobre suporte de TI</p>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender}`}>
                  <div className="message">
                    <p>{msg.text}</p>
                    {msg.fontes && msg.fontes.length > 0 && (
                      <div className="sources">
                        <span><FileText /> Fontes:</span>
                        <small>{msg.fontes.join(", ")}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message-row bot">
                  <div className="message loading"><Loader2 /></div>
                </div>
              )}
            </div>
          )}
        </section>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Digite sua pergunta sobre TI..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} aria-label="Enviar pergunta">
            {isLoading ? <Loader2 className="spin" /> : <><Send /><span>Enviar</span></>}
          </button>
        </form>
      </main>
    </div>
  );
}