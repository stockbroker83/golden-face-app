import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function getSessionId() {
  let id = sessionStorage.getItem("tarot_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tarot_session", id);
  }
  return id;
}

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const AMOUNT = 1980;
const ORDER_NAME = "타로 AI 마스터 프리미엄";

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const widgetsRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: "ANONYMOUS" });

        await widgets.setAmount({ currency: "KRW", value: AMOUNT });

        if (cancelled) return;

        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });

        await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });

        widgetsRef.current = widgets;
        setReady(true);
      } catch (e: any) {
        console.error("Widget init error:", e);
        if (!cancelled) setError("결제 위젯을 불러오는 중 오류가 발생했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const handlePayment = async () => {
    if (!widgetsRef.current) return;
    setError("");

    const orderId = "TAROT_" + Date.now();

    try {
      await supabase.from("payments").insert({
        session_id: getSessionId(),
        order_id: orderId,
        amount: AMOUNT,
        status: "pending",
        order_name: ORDER_NAME,
      });

      await widgetsRef.current.requestPayment({
        orderId,
        orderName: ORDER_NAME,
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
      });
    } catch (e: any) {
      if (e?.code === "USER_CANCEL") {
        setError("결제가 취소되었습니다.");
      } else {
        console.error("Payment error:", e);
        setError("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
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

      <div className="flex-1 flex flex-col px-6 py-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔮</div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">타로 AI 마스터 프리미엄</h2>
          <p className="text-muted-foreground text-sm">무제한 타로 리딩과 심층 해석을 경험하세요</p>
          <p className="text-2xl font-bold text-foreground mt-3">₩1,980</p>
          <p className="text-xs text-muted-foreground">1회 결제 · 평생 이용</p>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl animate-pulse mb-3">🔮</div>
              <p className="text-muted-foreground text-sm">결제 위젯 로딩 중...</p>
            </div>
          </div>
        )}

        <div id="payment-method" className="w-full" />
        <div id="agreement" className="w-full" />

        {error && (
          <p className="text-destructive text-sm my-3 text-center">{error}</p>
        )}

        {ready && (
          <button
            onClick={handlePayment}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base
                       hover:opacity-90 active:scale-[0.98] transition-all shadow-gold mt-4
                       flex items-center justify-center gap-2"
          >
            결제하기
          </button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          토스페이먼츠를 통한 안전한 결제
        </p>
      </div>
    </div>
  );
};

export default Payment;
