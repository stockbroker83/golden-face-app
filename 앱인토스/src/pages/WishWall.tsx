import { useState, useEffect } from "react";
import "../styles/ExtraFeatures.css";

interface Props {
  onBack: () => void;
  onSpendPoints: (amount: number, action: string, emoji: string) => boolean;
}

interface Wish {
  id: string;
  text: string;
  emoji: string;
  timestamp: string;
  likes: number;
}

const SAMPLE_WISHES: Wish[] = [
  { id: "1", text: "올해 꼭 이직 성공하게 해주세요 🙏", emoji: "⭐", timestamp: "2분 전", likes: 23 },
  { id: "2", text: "사랑하는 사람과 행복하게 해주세요", emoji: "💕", timestamp: "15분 전", likes: 45 },
  { id: "3", text: "가족 모두 건강하게 해주세요", emoji: "💚", timestamp: "32분 전", likes: 67 },
  { id: "4", text: "시험에 꼭 합격하게 해주세요!", emoji: "📖", timestamp: "1시간 전", likes: 34 },
  { id: "5", text: "부자 되게 해주세요 💰", emoji: "💰", timestamp: "2시간 전", likes: 89 },
  { id: "6", text: "좋은 인연 만나게 해주세요", emoji: "🌸", timestamp: "3시간 전", likes: 56 },
  { id: "7", text: "하는 일 모두 잘 되게 해주세요", emoji: "✨", timestamp: "4시간 전", likes: 78 },
  { id: "8", text: "마음의 평화를 찾게 해주세요", emoji: "🕊️", timestamp: "5시간 전", likes: 41 },
];

const WISH_EMOJIS = ["⭐", "💕", "💰", "💚", "📖", "🌸", "✨", "🕊️", "🙏", "🍀"];

export default function WishWall({ onBack, onSpendPoints }: Props) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [newWish, setNewWish] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("⭐");
  const [showInput, setShowInput] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 저장된 소원 + 샘플 소원 합치기
    const saved = localStorage.getItem("golden_face_wishes");
    const myWishes: Wish[] = saved ? JSON.parse(saved) : [];
    setWishes([...myWishes, ...SAMPLE_WISHES]);

    const savedLikes = localStorage.getItem("golden_face_liked");
    if (savedLikes) setLikedIds(new Set(JSON.parse(savedLikes)));
  }, []);

  const handleSubmit = () => {
    if (!newWish.trim()) return;

    const spent = onSpendPoints(1, "소원 등록", "🙏");
    if (!spent) {
      alert("복주머니가 부족해요. 소원 등록에는 1개가 필요합니다.");
      return;
    }

    const wish: Wish = {
      id: `my_${Date.now()}`,
      text: newWish.trim(),
      emoji: selectedEmoji,
      timestamp: "방금 전",
      likes: 0,
    };

    const updated = [wish, ...wishes];
    setWishes(updated);

    // 내 소원만 따로 저장
    const saved = localStorage.getItem("golden_face_wishes");
    const myWishes: Wish[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem("golden_face_wishes", JSON.stringify([wish, ...myWishes].slice(0, 20)));

    setNewWish("");
    setShowInput(false);
  };

  const handleLike = (id: string) => {
    if (likedIds.has(id)) return;

    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w))
    );

    const newLiked = new Set(likedIds);
    newLiked.add(id);
    setLikedIds(newLiked);
    localStorage.setItem("golden_face_liked", JSON.stringify(Array.from(newLiked)));
  };

  return (
    <div className="extra-page">
      <header className="extra-header">
        <button className="back-btn" onClick={onBack}>← 뒤로</button>
        <h1>🙏 소원의 담벼락</h1>
      </header>

      <div className="extra-hero compact">
        <h2>간절한 소원을 적어보세요</h2>
        <p>모두의 응원이 소원을 이뤄줍니다</p>
      </div>

      {!showInput ? (
        <button className="wish-write-btn" onClick={() => setShowInput(true)}>
          ✍️ 소원 적기 <span className="action-points-inline">-1 🏮</span>
        </button>
      ) : (
        <div className="wish-input-area">
          <div className="emoji-picker">
            {WISH_EMOJIS.map((e) => (
              <button
                key={e}
                className={`emoji-btn ${selectedEmoji === e ? "selected" : ""}`}
                onClick={() => setSelectedEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
          <textarea
            className="wish-textarea"
            placeholder="소원을 적어보세요..."
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            maxLength={100}
            rows={3}
          />
          <div className="wish-input-actions">
            <button className="wish-cancel" onClick={() => setShowInput(false)}>취소</button>
            <button
              className="wish-submit"
              onClick={handleSubmit}
              disabled={!newWish.trim()}
            >
              소원 등록 🙏
            </button>
          </div>
        </div>
      )}

      <div className="wish-list">
        {wishes.map((wish, idx) => (
          <div
            key={wish.id}
            className="wish-card"
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            <span className="wish-emoji">{wish.emoji}</span>
            <div className="wish-content">
              <p className="wish-text">{wish.text}</p>
              <span className="wish-time">{wish.timestamp}</span>
            </div>
            <button
              className={`wish-like ${likedIds.has(wish.id) ? "liked" : ""}`}
              onClick={() => handleLike(wish.id)}
            >
              <span>{likedIds.has(wish.id) ? "❤️" : "🤍"}</span>
              <span className="like-count">{wish.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
