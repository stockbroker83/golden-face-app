import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let id = sessionStorage.getItem("tarot_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tarot_session", id);
  }
  return id;
}

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
      const clientKey = "test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
      const orderId = "TAROT_" + Date.now();

      // Save pending payment to DB
      await supabase.from("payments").insert({
        session_id: getSessionId(),
        order_id: orderId,
        amount: 1980,
        status: "pending",
        order_name: "타로 AI 마스터 프리미엄",
      });

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: "ANONYMOUS_" + Date.now() });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: 1980 },
        orderId,
        orderName: "타로 AI 마스터 프리미엄",
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
        windowTarget: "self",
        card: {
          useEscrow: false,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (e: any) {
      if (e?.code === "USER_CANCEL") {
        setError("결제가 취소되었습니다.");
      } else {
        setError("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-bold text-foreground">프리미엄 결제</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="text-5xl mb-4">🔮</div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">타로 AI 마스터 프리미엄</h2>
        <p className="text-muted-foreground text-center mb-8">무제한 타로 리딩과 심층 해석을 경험하세요</p>

        <div className="w-full space-y-3 mb-8">
          {[
            { emoji: "✨", text: "무제한 타로 리딩" },
            { emoji: "🔮", text: "심층 카드 해석" },
            { emoji: "💫", text: "추가 질문 무제한" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-muted/50 border border-border rounded-xl px-4 py-3">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="w-full bg-card border border-border rounded-2xl p-6 text-center mb-6">
          <p className="text-muted-foreground text-sm mb-1">결제 금액</p>
          <p className="text-3xl font-bold text-foreground">₩1,980</p>
          <p className="text-xs text-muted-foreground mt-1">1회 결제 · 평생 이용</p>
        </div>

        {error && (
          <p className="text-destructive text-sm mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base
                     hover:opacity-90 active:scale-[0.98] transition-all shadow-gold
                     disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">결제 진행 중...</span>
          ) : (
            <>
              <CreditCard size={18} />
              카드로 결제하기
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          토스페이먼츠를 통한 안전한 결제
        </p>
      </div>
    </div>
  );
};

export default Payment;
