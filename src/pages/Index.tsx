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
          <div className="border-t border-border pt-5 space-y-3">
            <p className="text-muted-foreground text-xs leading-relaxed">
              타로 카드를 선택하면 AI 타로 마스터가
              <br />
              채팅을 통해 1:1 상담을 진행합니다.
              <br />
              <span className="text-primary/70">오늘의 운세를 확인해보세요 ✦</span>
            </p>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <button
                onClick={() => alert("이용약관\n\n제1조 (목적)\n본 약관은 타로 AI 마스터(이하 '서비스')가 제공하는 AI 타로 상담 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (서비스 내용)\n서비스는 AI 기반 타로 카드 리딩 및 상담을 제공합니다. 상담 결과는 오락 목적이며, 전문적인 조언을 대체하지 않습니다.\n\n제3조 (결제 및 환불)\n프리미엄 서비스 결제 후 7일 이내 미사용 시 전액 환불이 가능합니다.")}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                이용약관
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => alert("개인정보처리방침\n\n1. 수집하는 개인정보 항목\n- 결제 정보: 주문번호, 결제금액\n- 이용 기록: 상담 내역, 서비스 이용 기록\n\n2. 개인정보의 수집 및 이용 목적\n- 서비스 제공 및 운영\n- 결제 처리 및 환불\n\n3. 개인정보의 보유 및 이용 기간\n- 서비스 이용 종료 시까지 또는 관련 법령에 따른 보관 기간\n\n4. 문의\n- 이메일: support@tarotai.kr")}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                개인정보처리방침
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground/60 space-y-0.5">
              <p>서비스명: 타로 AI 마스터 | 운영: 협시입니다 저하로</p>
              <p>고객센터: support@tarotai.kr</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
