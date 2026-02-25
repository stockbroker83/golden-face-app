import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

const categoryMap: Record<string, { title: string; icon: string; systemPrompt: string }> = {
  daily: {
    title: "오늘의 운세",
    icon: "🌟",
    systemPrompt: "오늘 하루의 전반적인 운세",
  },
  love: {
    title: "연애운",
    icon: "💜",
    systemPrompt: "사랑과 연애에 관한 운세",
  },
  career: {
    title: "직장운",
    icon: "🏢",
    systemPrompt: "직장과 커리어에 관한 운세",
  },
  money: {
    title: "재물운",
    icon: "💰",
    systemPrompt: "재물과 금전에 관한 운세",
  },
  general: {
    title: "종합운",
    icon: "🔮",
    systemPrompt: "전반적인 종합 운세",
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

const tarotCards = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
];

function getRandomCards(n: number) {
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateTarotReading(category: string, userMessage: string) {
  const cards = getRandomCards(3);
  const { systemPrompt } = categoryMap[category] || categoryMap.daily;

  const readings: Record<string, string[]> = {
    daily: [
      `오늘 당신에게 나온 카드는 **${cards[0]}**, **${cards[1]}**, **${cards[2]}** 입니다.\n\n🌟 **과거의 영향**: ${cards[0]} 카드가 나타났습니다. 최근 당신이 겪어온 변화가 오늘의 에너지에 큰 영향을 미치고 있어요.\n\n✨ **현재의 에너지**: ${cards[1]} 카드는 지금 당신이 올바른 방향으로 나아가고 있음을 보여줍니다. 자신을 믿으세요.\n\n🔮 **오늘의 조언**: ${cards[2]} 카드가 말합니다 - 오늘은 새로운 시도를 두려워하지 마세요. 좋은 결과가 기다리고 있습니다.`,
    ],
    love: [
      `연애운을 위해 뽑힌 카드는 **${cards[0]}**, **${cards[1]}**, **${cards[2]}** 입니다.\n\n💜 **감정의 흐름**: ${cards[0]} 카드는 당신의 마음속 깊은 감정을 나타냅니다. 진심을 표현하는 것을 두려워하지 마세요.\n\n💕 **관계의 현재**: ${cards[1]} 카드가 보여주는 것은 상대방도 당신에게 관심을 가지고 있다는 신호입니다.\n\n🌹 **앞으로의 방향**: ${cards[2]} 카드는 용기를 내어 한 걸음 다가가면 아름다운 변화가 생길 것임을 암시합니다.`,
    ],
    career: [
      `직장운 카드는 **${cards[0]}**, **${cards[1]}**, **${cards[2]}** 입니다.\n\n🏢 **현재 직장 상황**: ${cards[0]} 카드는 지금 당신의 노력이 인정받을 시기가 다가오고 있음을 보여줍니다.\n\n📈 **성장의 기회**: ${cards[1]} 카드가 나타나 새로운 프로젝트나 역할에서 빛날 수 있는 기회가 올 것입니다.\n\n⭐ **조언**: ${cards[2]} 카드는 동료들과의 협력이 성공의 열쇠임을 알려줍니다.`,
    ],
    money: [
      `재물운 카드는 **${cards[0]}**, **${cards[1]}**, **${cards[2]}** 입니다.\n\n💰 **현재 재정 상태**: ${cards[0]} 카드는 현재 재정적 안정을 향해 나아가고 있음을 보여줍니다.\n\n📊 **투자와 기회**: ${cards[1]} 카드가 말하기를, 신중하되 과감한 결정이 필요한 시기입니다.\n\n🍀 **재물 조언**: ${cards[2]} 카드는 불필요한 지출을 줄이고 장기적인 계획을 세우라고 조언합니다.`,
    ],
    general: [
      `종합운 카드는 **${cards[0]}**, **${cards[1]}**, **${cards[2]}** 입니다.\n\n🔮 **전반적인 흐름**: ${cards[0]} 카드는 당신의 삶이 큰 전환점에 있음을 나타냅니다.\n\n🌙 **내면의 메시지**: ${cards[1]} 카드는 직감을 믿고 행동하라는 메시지를 전합니다.\n\n✨ **종합 조언**: ${cards[2]} 카드가 말합니다 - 긍정적인 마음가짐이 모든 것을 바꿀 수 있습니다. 오늘도 좋은 하루 되세요!`,
    ],
  };

  const categoryReadings = readings[category] || readings.daily;
  return categoryReadings[Math.floor(Math.random() * categoryReadings.length)];
}

const TarotChat = () => {
  const { category = "daily" } = useParams();
  const navigate = useNavigate();
  const info = categoryMap[category] || categoryMap.daily;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial greeting
    setIsTyping(true);
    const timer = setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: `${info.icon} 안녕하세요, 타로 AI 마스터입니다.\n\n**${info.title}**에 대해 상담해드리겠습니다.\n\n궁금한 것을 자유롭게 물어보세요. 카드를 뽑아 답변해드릴게요. ✦`,
        },
      ]);
      setIsTyping(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [category]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      const reading = generateTarotReading(category, userMsg);
      setMessages((prev) => [...prev, { role: "assistant", content: reading }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <button
          onClick={() => navigate("/")}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-xl">{info.icon}</span>
        <h1 className="font-display font-bold text-foreground">{info.title}</h1>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-gradient-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              {msg.content.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={j} className="text-primary font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="궁금한 것을 물어보세요..."
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                       focus:border-primary/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 
                       disabled:opacity-40 transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TarotChat;
