import TarotMenuCard from "@/components/TarotMenuCard";
import { getDailyCard } from "@/data/tarotCards";
import tarotBg from "@/assets/tarot-bg.jpg";

const menus = [
  { title: "오늘의 운세", icon: "🌟", description: "오늘 하루의 에너지를 읽어드립니다", path: "/chat/daily" },
  { title: "연애운", icon: "💜", description: "사랑과 관계에 대한 타로 리딩", path: "/chat/love" },
  { title: "직장운", icon: "🏢", description: "커리어와 직장에 대한 조언", path: "/chat/career" },
  { title: "재물운", icon: "💰", description: "금전과 재물의 흐름을 살펴봅니다", path: "/chat/money" },
  { title: "종합운", icon: "🔮", description: "전반적인 운세를 종합적으로 리딩", path: "/chat/general" },
];

const Index = () => {
  const daily = getDailyCard();
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayStr = dayNames[today.getDay()];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${tarotBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto px-5">
        {/* Header */}
        <header className="pt-10 pb-4 text-center">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-2 opacity-0 animate-fade-in-up">
            ✦ Tarot AI ✦
          </p>
          <h1
            className="font-display text-3xl font-bold text-gradient-gold opacity-0 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            타로 AI 마스터
          </h1>
        </header>

        {/* Daily Card */}
        <div
          className="text-center mb-5 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-xs text-muted-foreground mb-1">
            {dateStr} ({dayStr}요일)
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-card border border-border rounded-full px-4 py-2">
            <span className="text-lg">{daily.card.emoji}</span>
            <span className="text-sm text-foreground font-display">
              오늘의 카드: {daily.card.nameKo}
            </span>
            {daily.isReversed && (
              <span className="text-xs text-primary/80">(역위)</span>
            )}
          </div>
        </div>

        {/* Menu Cards */}
        <div className="flex-1 flex flex-col gap-3 pb-6">
          {menus.map((menu, i) => (
            <TarotMenuCard key={menu.path} {...menu} delay={300 + i * 100} />
          ))}
        </div>

        {/* Footer */}
        <footer className="pb-8 text-center opacity-0 animate-fade-in-up" style={{ animationDelay: "900ms" }}>
          <div className="border-t border-border pt-5">
            <p className="text-muted-foreground text-xs leading-relaxed">
              타로 카드를 선택하면 AI 타로 마스터가
              <br />
              채팅을 통해 1:1 상담을 진행합니다.
              <br />
              <span className="text-primary/70">오늘의 운세를 확인해보세요 ✦</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
