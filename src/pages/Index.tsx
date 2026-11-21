import { FormEvent, useState } from "react";
import {
  Bot,
  Cpu,
  FileText,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Network,
  Printer,
  Send,
  TicketCheck,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  fontes?: string[];
}

type View = "chat" | "topics" | "popular" | "ticket";

const API_URL = "http://localhost:8000/api/chat";

const topicos = [
  {
    categoria: "Redes",
    icon: Network,
    descricao: "Conectividade, internet, VPN e rede local",
    solucoes: [
      { titulo: "Internet lenta", pergunta: "Minha internet esta lenta. Como posso resolver?" },
      { titulo: "VPN nao conecta", pergunta: "Minha VPN nao esta conectando. O que devo verificar?" },
      { titulo: "Sem acesso ao Wi-Fi", pergunta: "Meu computador nao conecta ao Wi-Fi." },
    ],
  },
  {
    categoria: "Hardware",
    icon: Cpu,
    descricao: "Computador, notebook, energia e componentes",
    solucoes: [
      { titulo: "Computador nao liga", pergunta: "Meu computador nao liga. Quais verificacoes devo fazer?" },
      { titulo: "Notebook esquenta", pergunta: "Meu notebook esta superaquecendo. Como resolver?" },
      { titulo: "Monitor sem sinal", pergunta: "O monitor esta sem sinal enquanto o computador liga." },
    ],
  },
  {
    categoria: "Perifericos",
    icon: Printer,
    descricao: "Impressoras, monitores, mouse e teclado",
    solucoes: [
      { titulo: "Impressora offline", pergunta: "Minha impressora aparece offline." },
      { titulo: "Mouse nao funciona", pergunta: "Meu mouse parou de funcionar." },
      { titulo: "Teclado com falha", pergunta: "Algumas teclas do teclado nao respondem." },
    ],
  },
];

const maisBuscados = [
  { problema: "Computador nao liga", buscas: 248, crescimento: "+18%", solucao: "Verifique a energia, o cabo de alimentacao, bateria e monitor." },
  { problema: "VPN nao conecta", buscas: 213, crescimento: "+12%", solucao: "Confira a conexao com a internet, credenciais e status do aplicativo." },
  { problema: "Internet lenta", buscas: 176, crescimento: "+9%", solucao: "Teste o cabo, reinicie o equipamento e verifique o consumo da rede." },
  { problema: "Impressora offline", buscas: 142, crescimento: "+7%", solucao: "Confirme energia, rede, fila de impressao e drivers instalados." },
  { problema: "Esqueci minha senha", buscas: 121, crescimento: "+5%", solucao: "Use o processo de redefinicao corporativo ou abra um chamado." },
];

export default function Index() {
  const [activeView, setActiveView] = useState<View>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<{ numero: string; nome: string; problema: string } | null>(null);

  const abrirNoChat = (pergunta: string) => {
    setActiveView("chat");
    setInput(pergunta);
  };

  const handleSend = async (question?: string) => {
    const pergunta = (question ?? input).trim();
    if (!pergunta) return;

    setMessages((previous) => [
      ...previous,
      { id: crypto.randomUUID(), text: pergunta, sender: "user" },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const resposta = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta }),
      });
      if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);

      const dados = await resposta.json();
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          text: dados.resposta,
          fontes: dados.fontes ?? [],
          sender: "bot",
        },
      ]);
    } catch {
      toast.error("Nao consegui falar com o servidor. Ele esta rodando?");
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          text: "Erro de conexao com o backend. Verifique se o servidor Python esta rodando.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleSend();
  };

  const handleTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    const problema = String(form.get("problema") ?? "").trim();
    const descricao = String(form.get("descricao") ?? "").trim();
    if (!nome || !problema || !descricao) {
      toast.error("Preencha nome, problema e descricao.");
      return;
    }

    const numero = `BIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicket({ numero, nome, problema });
    toast.success(`Chamado ${numero} criado com sucesso.`);
  };

  const perguntasRapidas = [
    "Computador nao liga",
    "Internet lenta",
    "VPN nao conecta",
    "Impressora offline",
    "Esqueci minha senha",
  ];

  const renderChat = () => (
    <>
      <header className="chat-header">
        <div className="chat-brand">
          <div className="brand-icon small"><Bot /></div>
          <div><strong>Bit</strong><span>Assistente de Suporte de TI</span></div>
        </div>
        <p>Ola! Sou o Bit. Digite sua pergunta abaixo e eu ajudarei voce.</p>
        {messages.length === 0 && (
          <div className="quick-questions">
            <span className="quick-label">Perguntas rapidas</span>
            <div className="quick-buttons">
              {perguntasRapidas.map((pergunta) => (
                <button key={pergunta} type="button" onClick={() => void handleSend(pergunta)}>{pergunta}</button>
              ))}
            </div>
          </div>
        )}
      </header>

      <section className="conversation" aria-live="polite">
        {messages.length === 0 ? (
          <div className="empty-state"><Bot /><p>Faca sua primeira pergunta sobre suporte de TI</p></div>
        ) : (
          <div className="message-list">
            {messages.map((message) => (
              <div key={message.id} className={`message-row ${message.sender}`}>
                <div className="message">
                  <p>{message.text}</p>
                  {message.fontes && message.fontes.length > 0 && (
                    <div className="sources">
                      <span><FileText /> Fontes:</span>
                      <small>{message.fontes.join(", ")}</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && <div className="message-row bot"><div className="message loading"><Loader2 /></div></div>}
          </div>
        )}
      </section>

      <form className="composer" onSubmit={handleSubmit}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Digite sua pergunta sobre TI..." disabled={isLoading} />
        <button type="submit" disabled={isLoading || !input.trim()} aria-label="Enviar pergunta">
          {isLoading ? <Loader2 className="spin" /> : <><Send /><span>Enviar</span></>}
        </button>
      </form>
    </>
  );

  const renderTopics = () => (
    <section className="content-page">
      <div className="page-heading">
        <div className="page-icon"><LayoutGrid /></div>
        <div><h1>Topicos de suporte</h1><p>Selecione uma categoria e encontre uma solucao rapida.</p></div>
      </div>
      <div className="topic-grid">
        {topicos.map((topico) => {
          const Icon = topico.icon;
          return (
            <article className="topic-card" key={topico.categoria}>
              <div className="topic-title"><div><Icon /></div><div><h2>{topico.categoria}</h2><p>{topico.descricao}</p></div></div>
              <div className="solution-list">
                {topico.solucoes.map((solucao) => (
                  <div className="solution-item" key={solucao.titulo}>
                    <div><strong>{solucao.titulo}</strong><span>Solucao rapida disponivel</span></div>
                    <button type="button" onClick={() => abrirNoChat(solucao.pergunta)}>Falar no chat</button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );

  const renderPopular = () => (
    <section className="content-page">
      <div className="page-heading">
        <div className="page-icon popular"><TrendingUp /></div>
        <div><h1>Mais buscados</h1><p>Principais problemas consultados pelos usuarios nesta semana.</p></div>
      </div>
      <div className="popular-list">
        {maisBuscados.map((item, index) => (
          <article className="popular-card" key={item.problema}>
            <div className="rank">{index + 1}</div>
            <div className="popular-content"><h2>{item.problema}</h2><p>{item.solucao}</p></div>
            <div className="popular-meta"><strong>{item.buscas}</strong><span>buscas</span><em>{item.crescimento}</em></div>
            <button type="button" onClick={() => abrirNoChat(`${item.problema}. ${item.solucao}`)}>Resolver no chat</button>
          </article>
        ))}
      </div>
    </section>
  );

  const renderTicket = () => (
    <section className="content-page ticket-page">
      <div className="page-heading">
        <div className="page-icon ticket"><TicketCheck /></div>
        <div><h1>Abrir chamado</h1><p>Informe os dados do problema para gerar um ticket.</p></div>
      </div>
      {ticket ? (
        <div className="ticket-success">
          <div className="ticket-success-icon"><TicketCheck /></div>
          <span>Chamado criado</span>
          <h2>{ticket.numero}</h2>
          <p><strong>{ticket.nome}</strong>, seu chamado sobre <strong>{ticket.problema}</strong> foi registrado com sucesso.</p>
          <button type="button" onClick={() => setTicket(null)}>Abrir outro chamado</button>
        </div>
      ) : (
        <form className="ticket-form" onSubmit={handleTicket}>
          <label>Nome completo<input name="nome" placeholder="Ex: Maria Silva" /></label>
          <label>Problema<input name="problema" placeholder="Ex: Impressora offline" /></label>
          <label>Descreva o problema<textarea name="descricao" rows={6} placeholder="Descreva o que aconteceu, quando começou e o que já foi tentado." /></label>
          <button type="submit"><TicketCheck /> Gerar ticket</button>
        </form>
      )}
    </section>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><Bot /></div><div><strong>Bit</strong><span>Assistente de TI</span></div></div>
        <nav className="side-nav" aria-label="Menu principal">
          <button className={`nav-item ${activeView === "chat" ? "active" : ""}`} type="button" onClick={() => setActiveView("chat")}><MessageSquare /><span>Chat</span></button>
          <button className={`nav-item ${activeView === "topics" ? "active" : ""}`} type="button" onClick={() => setActiveView("topics")}><LayoutGrid /><span>Topicos</span></button>
          <button className={`nav-item ${activeView === "popular" ? "active" : ""}`} type="button" onClick={() => setActiveView("popular")}><TrendingUp /><span>Mais Buscados</span></button>
        </nav>
        <button className="ticket-button" type="button" onClick={() => setActiveView("ticket")}><TicketCheck /><span>Abrir Chamado</span></button>
      </aside>
      <main className={activeView === "chat" ? "chat-shell" : "pages-shell"}>
        {activeView === "chat" && renderChat()}
        {activeView === "topics" && renderTopics()}
        {activeView === "popular" && renderPopular()}
        {activeView === "ticket" && renderTicket()}
      </main>
    </div>
  );
}
