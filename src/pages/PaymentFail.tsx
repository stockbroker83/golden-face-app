import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentFail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const code = params.get("code");
  const message = params.get("message");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center max-w-md mx-auto px-6">
      <div className="text-5xl mb-4">😔</div>
      <h1 className="font-display text-xl font-bold text-foreground mb-2">결제에 실패했어요</h1>
      <p className="text-muted-foreground text-sm text-center mb-2">
        {message || "결제 처리 중 문제가 발생했습니다."}
      </p>
      {code && <p className="text-xs text-muted-foreground mb-8">오류 코드: {code}</p>}

      <div className="w-full space-y-3">
        <button
          onClick={() => navigate("/payment")}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold
                     hover:opacity-90 active:scale-[0.98] transition-all"
        >
          다시 시도하기
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-xl bg-muted text-foreground font-bold
                     hover:opacity-90 active:scale-[0.98] transition-all"
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default PaymentFail;
