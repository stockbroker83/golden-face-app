import { useMemo, useState, useEffect } from "react";
import "../styles/PricingCard.css";

interface PricingCardProps {
  salePrice?: number;
  originalPrice?: number;
}

function getMidnightCountdown() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { hours, minutes, seconds };
}

export default function PricingCard({ salePrice = 18900, originalPrice = 25000 }: PricingCardProps) {
  const [timeLeft, setTimeLeft] = useState(getMidnightCountdown());

  const buyers = useMemo(() => 900 + Math.floor(Math.random() * 601), []);
  const leftStock = useMemo(() => 30 + Math.floor(Math.random() * 31), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getMidnightCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pricing-card">
      <div className="pricing-header">
        <span className="discount-badge">24% 할인</span>
        <div className="price-line">
          <span className="original-price">₩{originalPrice.toLocaleString()}</span>
          <strong className="sale-price">₩{salePrice.toLocaleString()}</strong>
        </div>
      </div>

      <div className="pricing-signals">
        <p>오늘 <strong>{buyers.toLocaleString()}명</strong> 구매</p>
        <p>남은 수량 <strong>{leftStock}개</strong></p>
      </div>

      <div className="countdown-box">
        오늘 마감까지
        <strong>
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </strong>
      </div>
    </div>
  );
}
