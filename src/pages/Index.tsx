import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, FileText } from "lucide-react";
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
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
        body: JSON.stringify({ pergunta: input }),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Bit - Assistente de Suporte de TI</CardTitle>
            </div>
            <CardDescription>
              Olá! Sou o assistente de suporte de TI. Digite sua pergunta abaixo e eu ajudarei você.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.fontes && msg.fontes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Fontes:
                        </p>
                        <p className="text-xs text-gray-500">{msg.fontes.join(", ")}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}