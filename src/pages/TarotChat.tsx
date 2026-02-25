import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { drawCards } from "@/data/tarotCards";
import type { TarotCard } from "@/data/tarotCards";
import TarotCardSpread from "@/components/TarotCardSpread";
import QuickQuestions from "@/components/QuickQuestions";
import PremiumBottomSheet from "@/components/PremiumBottomSheet";
import { supabase } from "@/integrations/supabase/client";

const categoryMap: Record<string, { title: string; icon: string }> = {
  daily: { title: "오늘의 운세", icon: "🌟" },
  love: { title: "연애운", icon: "💜" },
  career: { title: "직장운", icon: "🏢" },
  money: { title: "재물운", icon: "💰" },
  general: { title: "종합운", icon: "🔮" },
};

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  cards?: DrawnCard[];
  cardsRevealed?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-chat`;

function getSessionId() {
  let id = sessionStorage.getItem("tarot_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tarot_session", id);
  }
  return id;
}

function getReadingCount(): number {
  return parseInt(localStorage.getItem("tarot_reading_count") || "0", 10);
}

function incrementReadingCount(): number {
  const count = getReadingCount() + 1;
  localStorage.setItem("tarot_reading_count", String(count));
  return count;
}

const TarotChat = () => {
  const { category = "daily" } = useParams();
  const navigate = useNavigate();
  const info = categoryMap[category] || categoryMap.daily;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `${info.icon} 안녕하세요, 타로 AI 마스터입니다.\n\n${info.title}에 대해 상담해드리겠습니다.\n\n궁금한 것을 자유롭게 물어보세요. 카드 3장을 뽑아 과거·현재·미래의 흐름을 읽어드릴게요. ✦`,
      },
    ]);
  }, [category]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg || isLoading) return;
    setInput("");

    // Draw cards
    const drawn = drawCards(3);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Show card drawing animation
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "카드를 뽑는 중... ✦", cards: drawn, cardsRevealed: false },
    ]);
    setIsLoading(true);

    // Reveal cards after a delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, cardsRevealed: true } : m
        )
      );
    }, 600);

    // Build AI prompt with card info
    const cardInfo = drawn
      .map((d, i) => {
        const pos = ["과거", "현재", "미래"][i];
        const orientation = d.isReversed ? "역위" : "정위";
        const meaning = d.isReversed ? d.card.reversed : d.card.upright;
        return `${pos}: ${d.card.nameKo} (${orientation}) - ${meaning}`;
      })
      .join("\n");

    const aiMessages = [
      ...messages
        .filter((m) => m.role === "user" || (m.role === "assistant" && !m.cards))
        .map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user" as const,
        content: `질문: ${userMsg}\n\n뽑힌 카드:\n${cardInfo}\n\n위 카드들을 바탕으로 ${info.title}에 대해 해석해주세요.`,
      },
    ];

    // Stream AI response
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: aiMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "AI 서비스 오류");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantText = "";

      const updateAssistant = (text: string) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.cards && last.role === "assistant") {
            // Update the card message with reading text
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: text } : m
            );
          }
          return prev;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantText += content;
              updateAssistant(assistantText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save to database
      try {
        await supabase.from("tarot_readings").insert({
          session_id: getSessionId(),
          category,
          question: userMsg,
          cards: drawn.map((d, i) => ({
            position: ["past", "present", "future"][i],
            name: d.card.nameKo,
            isReversed: d.isReversed,
          })),
          answer: assistantText,
        });
      } catch (e) {
        console.error("Failed to save reading:", e);
      }

      // Check premium
      const count = incrementReadingCount();
      if (count >= 2 && localStorage.getItem("isPremium") !== "true") {
        setTimeout(() => setShowPremium(true), 1500);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, content: "죄송합니다. 일시적인 오류가 발생했어요. 다시 시도해주세요. 🙏" }
            : m
        )
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground">
          <ArrowLeft size={20} />
        </button>
        <span className="text-xl">{info.icon}</span>
        <h1 className="font-display font-bold text-foreground">{info.title}</h1>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-gradient-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              {msg.cards && (
                <TarotCardSpread cards={msg.cards} revealed={msg.cardsRevealed ?? false} />
              )}
              {msg.content !== "카드를 뽑는 중... ✦" ? (
                msg.content
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="animate-float">🃏</span>
                  <span>카드를 뽑는 중...</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.content === "카드를 뽑는 중... ✦" && null}
      </div>

      {/* Quick Questions + Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-card/80 backdrop-blur-sm space-y-2">
        <QuickQuestions onSelect={(q) => handleSend(q)} disabled={isLoading} />
        <div className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="궁금한 것을 물어보세요..."
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                       focus:border-primary/50 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90
                       disabled:opacity-40 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <PremiumBottomSheet open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
};

export default TarotChat;
