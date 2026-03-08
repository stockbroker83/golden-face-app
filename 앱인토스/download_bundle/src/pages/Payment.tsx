import { useState } from "react";
import { IAP } from "@apps-in-toss/web-framework";
import { vibrateLight, vibrateSuccess, vibrateError } from "../utils/haptic";
import "../styles/Payment.css";

interface Props {
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const PRICE = {
  original: 25000,
  sale: 19000,
};

const BENEFITS = [
  "관상 12가지 상세 분석",
  "사주 4대운 (연애·재물·건강·직장)",
  "타로 3장 스프레드 리딩",
  "주역 64괘 운세 해석",
  "PDF 저장 및 공유",
];

export default function Payment({ onPaymentSuccess, onBack }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canUseTestBypass, setCanUseTestBypass] = useState(false);

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
            errorMessage = "웹 테스트 환경에서는 토스 IAP가 제한됩니다. 아래 테스트 모드 버튼을 사용해 주세요.";
          }

          setCanUseTestBypass(isRuntimeIssue || import.meta.env.DEV);
          setError(errorMessage);
          setIsProcessing(false);
          vibrateError();
          cleanup?.();
        },
      });
    } catch (err: any) {
      setError(err?.message || "결제를 시작할 수 없습니다.");
      setCanUseTestBypass(true);
      setIsProcessing(false);
      vibrateError();
    }
  };

  return (
    <div className="page payment-page">
      <button className="btn-back" onClick={onBack}>
        ← 뒤로
      </button>

      <div className="payment-hero">
        <div className="hero-badge">금빛관상 프리미엄</div>
        <h2>평생 운명 리포트 잠금 해제</h2>
        <p>관상 · 사주 · 타로 · 주역을 한 번에 확인하세요.</p>
      </div>

      <div className="payment-card">
        <h3>포함 내용</h3>
        <ul className="features-included">
          {BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="price-box">
          <div className="price-row">
            <span>정가</span>
            <strong className="original">₩{PRICE.original.toLocaleString()}</strong>
          </div>
          <div className="price-row">
            <span>할인가</span>
            <strong className="sale">₩{PRICE.sale.toLocaleString()} (24% OFF)</strong>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {canUseTestBypass && (
          <button className="btn-test-bypass" onClick={proceedWithTestBypass}>
            🧪 테스트 모드로 프리미엄 열기
          </button>
        )}

        <button className="btn-payment" onClick={handlePayment} disabled={isProcessing}>
          {isProcessing ? "결제 처리 중..." : "₩19,000 결제하기"}
        </button>

        <p className="payment-footnote">💯 만족하지 못하면 100% 환불 · 토스페이먼츠 안전 결제</p>
      </div>
    </div>
  );
}
