import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PremiumBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

const PremiumBottomSheet = ({ open, onClose }: PremiumBottomSheetProps) => {
  const navigate = useNavigate();

  // Don't show if already premium
  if (!open || localStorage.getItem("isPremium") === "true") return null;

  const handlePurchase = () => {
    onClose();
    navigate("/payment");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-t border-border rounded-t-2xl p-6 pb-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <span className="text-3xl">🔮</span>
          <h3 className="font-display text-lg font-bold text-foreground mt-2">
            더 깊은 상담을 원하시나요?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            프리미엄으로 무제한 타로 리딩을 받아보세요
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { emoji: "✨", text: "무제한 타로 리딩" },
            { emoji: "🔮", text: "심층 카드 해석" },
            { emoji: "💫", text: "추가 질문 무제한" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-2.5">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handlePurchase}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm
                     hover:opacity-90 active:scale-[0.98] transition-all shadow-gold"
        >
          ₩1,980으로 무제한 상담 시작하기
        </button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          닫기를 누르면 무료로 계속 이용 가능합니다
        </p>
      </div>
    </div>
  );
};

export default PremiumBottomSheet;
