import { useEffect, useState } from "react";
import { IAP } from "@apps-in-toss/web-framework";
import PricingCard from "../components/PricingCard";
import { vibrateLight, vibrateSuccess, vibrateError } from "../utils/haptic";
import "../styles/Payment.css";

interface Props {
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const BENEFITS = [
  "관상 12가지 상세 분석",
  "사주 4대운 + 타로 + 주역",
  "궁합/심리테스트 공유 기능",
  "PDF 저장 및 재열람",
];

const FAQS = [
  {
    q: "자동 결제(구독)인가요?",
    a: "아니요. 1회 결제 상품이며 자동 갱신되지 않습니다.",
  },
  {
    q: "환불 가능한가요?",
    a: "구매 후 7일 이내, 사용 이력 확인 후 100% 환불을 지원합니다.",
  },
];

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || "";
const TOSS_CONFIRM_API_URL = import.meta.env.VITE_TOSS_CONFIRM_API_URL || "/api/toss/confirm";
const TOSS_SCRIPT_URL = "https://js.tosspayments.com/v1/payment";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        params: {
          amount: number;
          orderId: string;
          orderName: string;
          customerName?: string;
          successUrl: string;
          failUrl: string;
        }
      ) => Promise<void>;
    };
  }
}

export default function Payment({ onPaymentSuccess, onBack }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canUseTestBypass, setCanUseTestBypass] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("paymentStatus");
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");
    const code = params.get("code");
    const message = params.get("message");

    if (paymentStatus === "success" && paymentKey && orderId && amount) {
      void finalizeWebPayment(paymentKey, orderId, amount);
      return;
    }

    if (paymentStatus === "fail") {
      setError(message || code || "토스페이먼츠 결제에 실패했습니다.");
      setIsProcessing(false);
      setCanUseTestBypass(import.meta.env.DEV);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, []);

  const grantVip = (orderId: string) => {
    localStorage.setItem(
      "golden_face_vip",
      JSON.stringify({
        user_id: String(Date.now()),
        is_vip: true,
        purchased_at: new Date().toISOString(),
        order_id: orderId,
      })
    );
  };

  const proceedWithTestBypass = () => {
    grantVip("TEST_BYPASS");
    vibrateSuccess();
    onPaymentSuccess();
  };

  const finalizeWebPayment = async (paymentKey: string, orderId: string, amount: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      if (!TOSS_CONFIRM_API_URL && !import.meta.env.DEV) {
        throw new Error("운영 환경에서는 결제 승인 API(VITE_TOSS_CONFIRM_API_URL) 설정이 필요합니다.");
      }

      if (TOSS_CONFIRM_API_URL) {
        const response = await fetch(TOSS_CONFIRM_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
        });

        if (!response.ok) {
          throw new Error("결제 승인 검증에 실패했습니다.");
        }
      }

      grantVip(orderId);
      vibrateSuccess();
      onPaymentSuccess();
    } catch (err: any) {
      setError(err?.message || "결제 검증 중 오류가 발생했습니다.");
      setCanUseTestBypass(import.meta.env.DEV);
      vibrateError();
    } finally {
      setIsProcessing(false);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  };

  const loadTossScript = async () => {
    if (window.TossPayments) return;

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${TOSS_SCRIPT_URL}"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("토스 스크립트 로딩 실패")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = TOSS_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("토스 스크립트 로딩 실패"));
      document.head.appendChild(script);
    });
  };

  const startWebTossPayment = async () => {
    if (!TOSS_CLIENT_KEY) {
      throw new Error("VITE_TOSS_CLIENT_KEY가 설정되지 않았습니다.");
    }

    await loadTossScript();

    if (!window.TossPayments) {
      throw new Error("토스페이먼츠 SDK를 초기화할 수 없습니다.");
    }

    const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
    const orderId = `golden_${Date.now()}`;
    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    await tossPayments.requestPayment("카드", {
      amount: 18900,
      orderId,
      orderName: "금빛관상 프리미엄 운세 리포트",
      customerName: "금빛관상 고객",
      successUrl: `${baseUrl}?paymentStatus=success`,
      failUrl: `${baseUrl}?paymentStatus=fail`,
    });
  };

  const handlePayment = () => {
    setError(null);
    setIsProcessing(true);
    vibrateLight();

    try {
      const cleanup = IAP.createOneTimePurchaseOrder({
        options: {
          sku: "premium_fortune",
          processProductGrant: ({ orderId }) => {
            grantVip(orderId);
            return true;
          },
        },
        onEvent: (event) => {
          grantVip(event.data.orderId);
          setIsProcessing(false);
          vibrateSuccess();
          onPaymentSuccess();
          cleanup?.();
        },
        onError: (err: any) => {
          const code = String(err?.code || err?.message || "");
          const isRuntimeIssue =
            code.includes("getOperationalEnvironment") ||
            code.includes("not a constant handler") ||
            code.includes("window") ||
            code.includes("undefined");

          let errorMessage = "결제 처리 중 오류가 발생했습니다.";
          if (code.includes("USER_CANCEL") || code.toLowerCase().includes("cancel")) {
            errorMessage = "결제가 취소되었습니다.";
          } else if (code.includes("NETWORK") || code.toLowerCase().includes("timeout")) {
            errorMessage = "네트워크 상태가 불안정합니다. 잠시 후 다시 시도해 주세요.";
          } else if (code.includes("PAYMENT_FAILED") || code.toLowerCase().includes("failed")) {
            errorMessage = "결제 승인에 실패했습니다. 결제 수단을 확인해 주세요.";
          } else if (isRuntimeIssue) {
            errorMessage = "웹 테스트 환경에서는 토스 IAP가 제한됩니다. 아래 테스트 모드를 사용해 주세요.";
          }

          if (isRuntimeIssue && TOSS_CLIENT_KEY) {
            cleanup?.();
            void startWebTossPayment().catch((webErr: any) => {
              setCanUseTestBypass(import.meta.env.DEV);
              setError(webErr?.message || errorMessage);
              setIsProcessing(false);
              vibrateError();
            });
            return;
          }

          setCanUseTestBypass(isRuntimeIssue || import.meta.env.DEV);
          setError(errorMessage);
          setIsProcessing(false);
          vibrateError();
          cleanup?.();
        },
      });
    } catch (err: any) {
      if (TOSS_CLIENT_KEY) {
        void startWebTossPayment().catch((webErr: any) => {
          setError(webErr?.message || err?.message || "결제를 시작할 수 없습니다.");
          setCanUseTestBypass(true);
          setIsProcessing(false);
          vibrateError();
        });
      } else {
        setError(err?.message || "결제를 시작할 수 없습니다.");
        setCanUseTestBypass(true);
        setIsProcessing(false);
        vibrateError();
      }
    }
  };

  return (
    <div className="page payment-page">
      <button className="btn-back" onClick={onBack}>← 뒤로</button>

      <div className="payment-hero">
        <div className="trust-top-row">
          <span className="toss-logo">toss payments</span>
          <span className="refund-badge">100% 환불 보장 (7일)</span>
        </div>
        <h2>프리미엄 운세 전체 공개</h2>
        <p>⭐ 4.9 (12,847 리뷰) · 지금 가장 인기 있는 확장 리포트</p>
      </div>

      <div className="payment-card">
        <h3>포함 내용</h3>
        <ul className="features-included">
          {BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <PricingCard salePrice={18900} originalPrice={25000} />

        <section className="premium-benefit-box">
          <h4>🎁 프리미엄 구매 시 즉시 받는 5가지 특전</h4>
          <ul>
            <li>✅ 관상 12개 전체 공개 (₩49,000 상당)</li>
            <li>✅ 2026년 월별 운세 (₩19,900 상당)</li>
            <li>✅ 타로 3장 + 사주팔자 (₩29,900 상당)</li>
            <li>✅ PDF 다운로드 영구 보관 (₩9,900 상당)</li>
            <li>✅ 궁합/심리테스트 무제한 (₩15,000 상당)</li>
          </ul>
          <p className="benefit-total">총 가치: ₩123,700</p>
          <p className="benefit-sale">→ 오늘만 ₩18,900 (84% 할인!)</p>
        </section>

        {error && <div className="error-message">⚠️ {error}</div>}

        {canUseTestBypass && (
          <button className="btn-test-bypass" onClick={proceedWithTestBypass}>
            🧪 테스트 모드로 프리미엄 열기
          </button>
        )}

        <button className="btn-payment" onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? "결제 처리 중..." : "₩18,900로 전체 운세 확인하기"}
        </button>

        <section className="faq-section">
          <h4>자주 묻는 질문</h4>
          {FAQS.map((item) => (
            <div className="faq-item" key={item.q}>
              <strong>{item.q}</strong>
              <p>{item.a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
