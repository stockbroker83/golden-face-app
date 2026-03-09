export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  suit?: string;
  arcana: "major" | "minor";
  emoji: string;
  upright: string;
  reversed: string;
}

const majorArcana: TarotCard[] = [
  { id: 0, name: "The Fool", nameKo: "광대", arcana: "major", emoji: "🃏", upright: "새로운 시작, 모험, 자유, 순수함", reversed: "무모함, 부주의, 위험, 방향 상실" },
  { id: 1, name: "The Magician", nameKo: "마법사", arcana: "major", emoji: "🎩", upright: "창조력, 의지력, 기술, 자신감", reversed: "속임수, 재능 낭비, 조작, 불안" },
  { id: 2, name: "The High Priestess", nameKo: "여사제", arcana: "major", emoji: "🌙", upright: "직감, 지혜, 신비, 내면의 목소리", reversed: "비밀, 혼란, 감정 억압, 얕은 판단" },
  { id: 3, name: "The Empress", nameKo: "여황제", arcana: "major", emoji: "👑", upright: "풍요, 모성, 자연, 창조", reversed: "의존, 공허, 창조력 차단, 과보호" },
  { id: 4, name: "The Emperor", nameKo: "황제", arcana: "major", emoji: "🏛️", upright: "권위, 안정, 리더십, 구조", reversed: "독재, 경직, 통제 과잉, 무력함" },
  { id: 5, name: "The Hierophant", nameKo: "교황", arcana: "major", emoji: "📿", upright: "전통, 가르침, 신앙, 도덕", reversed: "반항, 비전통적, 자유로운 사고" },
  { id: 6, name: "The Lovers", nameKo: "연인", arcana: "major", emoji: "💕", upright: "사랑, 조화, 선택, 결합", reversed: "불화, 갈등, 유혹, 잘못된 선택" },
  { id: 7, name: "The Chariot", nameKo: "전차", arcana: "major", emoji: "⚔️", upright: "승리, 의지, 결단력, 전진", reversed: "방향 상실, 공격성, 좌절, 통제 불능" },
  { id: 8, name: "Strength", nameKo: "힘", arcana: "major", emoji: "🦁", upright: "용기, 인내, 내면의 힘, 자비", reversed: "자기 의심, 나약함, 불안, 포기" },
  { id: 9, name: "The Hermit", nameKo: "은둔자", arcana: "major", emoji: "🏔️", upright: "내면 탐구, 고독, 지혜, 성찰", reversed: "고립, 외로움, 현실 도피, 편협" },
  { id: 10, name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", arcana: "major", emoji: "🎡", upright: "변화, 행운, 순환, 전환점", reversed: "불운, 저항, 정체, 예상치 못한 변화" },
  { id: 11, name: "Justice", nameKo: "정의", arcana: "major", emoji: "⚖️", upright: "공정, 진실, 균형, 책임", reversed: "불공정, 거짓, 편견, 회피" },
  { id: 12, name: "The Hanged Man", nameKo: "매달린 사람", arcana: "major", emoji: "🙃", upright: "희생, 새로운 관점, 인내, 깨달음", reversed: "지연, 저항, 무의미한 희생" },
  { id: 13, name: "Death", nameKo: "죽음", arcana: "major", emoji: "🌑", upright: "변환, 끝과 시작, 변화, 해방", reversed: "변화 거부, 정체, 두려움, 집착" },
  { id: 14, name: "Temperance", nameKo: "절제", arcana: "major", emoji: "⏳", upright: "균형, 절제, 조화, 인내심", reversed: "극단, 불균형, 과잉, 조급함" },
  { id: 15, name: "The Devil", nameKo: "악마", arcana: "major", emoji: "😈", upright: "유혹, 집착, 물질주의, 속박", reversed: "해방, 자각, 속박에서 벗어남" },
  { id: 16, name: "The Tower", nameKo: "탑", arcana: "major", emoji: "🗼", upright: "급변, 파괴, 깨달음, 해방", reversed: "재난 회피, 변화 두려움, 지연된 파괴" },
  { id: 17, name: "The Star", nameKo: "별", arcana: "major", emoji: "⭐", upright: "희망, 영감, 치유, 평화", reversed: "절망, 불신, 단절, 희망 상실" },
  { id: 18, name: "The Moon", nameKo: "달", arcana: "major", emoji: "🌕", upright: "환상, 직감, 불안, 잠재의식", reversed: "혼란 해소, 진실 발견, 두려움 극복" },
  { id: 19, name: "The Sun", nameKo: "태양", arcana: "major", emoji: "☀️", upright: "기쁨, 성공, 활력, 긍정", reversed: "일시적 우울, 과잉 낙관, 지연된 성공" },
  { id: 20, name: "Judgement", nameKo: "심판", arcana: "major", emoji: "📯", upright: "부활, 각성, 판단, 해방", reversed: "자기 의심, 후회, 판단력 부족" },
  { id: 21, name: "The World", nameKo: "세계", arcana: "major", emoji: "🌍", upright: "완성, 성취, 통합, 여행", reversed: "미완성, 지연, 목표 부재, 정체" },
];

function createMinorCards(suit: string, suitKo: string, suitEmoji: string): TarotCard[] {
  const ranks = [
    { name: "Ace", nameKo: "에이스", upright: "", reversed: "" },
    { name: "Two", nameKo: "2", upright: "", reversed: "" },
    { name: "Three", nameKo: "3", upright: "", reversed: "" },
    { name: "Four", nameKo: "4", upright: "", reversed: "" },
    { name: "Five", nameKo: "5", upright: "", reversed: "" },
    { name: "Six", nameKo: "6", upright: "", reversed: "" },
    { name: "Seven", nameKo: "7", upright: "", reversed: "" },
    { name: "Eight", nameKo: "8", upright: "", reversed: "" },
    { name: "Nine", nameKo: "9", upright: "", reversed: "" },
    { name: "Ten", nameKo: "10", upright: "", reversed: "" },
    { name: "Page", nameKo: "시종", upright: "", reversed: "" },
    { name: "Knight", nameKo: "기사", upright: "", reversed: "" },
    { name: "Queen", nameKo: "여왕", upright: "", reversed: "" },
    { name: "King", nameKo: "왕", upright: "", reversed: "" },
  ];

  const suitMeanings: Record<string, { upright: string[]; reversed: string[] }> = {
    Wands: {
      upright: [
        "영감, 새로운 시작, 창조력", "계획, 결정, 미래 전망", "확장, 해외, 선견지명",
        "축하, 안정, 조화", "갈등, 경쟁, 의견 충돌", "승리, 인정, 성공",
        "방어, 도전, 용기", "빠른 진행, 속도, 행동", "경계, 인내, 회복력",
        "부담, 책임, 과로", "열정, 탐험, 자유로운 영혼", "에너지, 열정, 모험",
        "자신감, 독립, 매력", "비전, 리더십, 명예"
      ],
      reversed: [
        "지연, 방향 상실, 망설임", "두려움, 나쁜 계획, 제한된 시야", "지연, 좌절, 장애물",
        "불안, 과도기, 미완성", "타협, 합의, 갈등 해소", "오만, 실패, 체면 손상",
        "불안, 포기, 타협", "지연, 좌절, 혼란", "의심, 경계심 부족, 취약함",
        "해방, 짐을 내려놓음, 위임", "방향 상실, 에너지 분산, 지연", "조급, 지연, 좌절",
        "질투, 이기심, 조급함", "독단, 비효율, 높은 기대"
      ],
    },
    Cups: {
      upright: [
        "새로운 감정, 사랑의 시작, 직감", "파트너십, 조화, 상호 매력", "우정, 축하, 기쁨",
        "무관심, 명상, 재평가", "상실, 슬픔, 후회", "향수, 추억, 순수함",
        "환상, 선택, 상상력", "떠남, 포기, 새로운 길", "만족, 감사, 소원 성취",
        "화목, 가정, 행복", "창의적 기회, 직감적 메시지", "로맨스, 매력, 감수성",
        "공감, 돌봄, 직감", "감정적 균형, 관대함, 지혜"
      ],
      reversed: [
        "감정 차단, 빈 감정, 창의력 고갈", "불균형, 이별, 불화", "고독, 과음, 부정적 관계",
        "새로운 기회, 동기 부여, 행동", "수용, 회복, 용서", "비현실적, 과거에 집착",
        "혼란, 유혹, 비현실적 기대", "두려움, 집착, 포기 거부", "탐욕, 불만족, 물질주의",
        "갈등, 가정 불화, 단절", "감정적 미성숙, 창의력 차단", "변덕, 질투, 비현실적 기대",
        "자기 돌봄 부족, 공허함, 의존", "감정적 조작, 변덕, 자기중심"
      ],
    },
    Swords: {
      upright: [
        "명확성, 진실, 새로운 아이디어", "결정 보류, 교착 상태, 균형", "심통, 이별, 슬픔",
        "휴식, 명상, 회복", "갈등, 패배감, 비열함", "전환, 치유, 여행",
        "속임수, 전략, 은밀한 행동", "제한, 속박, 자기 제한", "걱정, 불안, 악몽",
        "끝, 배신, 고통의 절정", "지적 호기심, 새로운 아이디어", "결단력, 직접적 의사소통",
        "독립, 슬픔, 명확한 경계", "지적 권위, 진실, 명확한 사고"
      ],
      reversed: [
        "혼란, 잔인함, 과도한 힘", "우유부단, 정보 부족, 거짓말", "화해, 용서, 회복",
        "불안, 행동 개시, 주의력 부족", "화해, 변화, 과거 극복", "정체, 미해결 문제",
        "정직, 자수, 양심", "자유, 새로운 관점, 해방", "희망, 회복, 도움 요청",
        "회복, 재생, 극복", "조급함, 날카로움, 소문", "냉정함, 잔인함, 왕따",
        "자비, 후회, 감정 개방", "권력 남용, 조작, 잔인함"
      ],
    },
    Pentacles: {
      upright: [
        "새로운 재정적 기회, 번영의 시작", "균형, 적응, 우선순위", "팀워크, 기술, 성장",
        "안정, 소유, 보수적", "재정적 어려움, 고립, 걱정", "관대함, 나눔, 번영",
        "인내, 장기 투자, 성장", "장인정신, 숙련, 노력", "독립, 풍요, 자급자족",
        "유산, 가족, 장기적 성공", "학습, 새로운 기회, 재정 소식", "신뢰, 인내, 꾸준함",
        "풍요, 실용적, 안정감", "부, 사업 성공, 리더십"
      ],
      reversed: [
        "기회 놓침, 재정 불안, 계획 부족", "불균형, 과도한 업무, 우선순위 혼란", "평범함, 동기 부족, 품질 저하",
        "탐욕, 물질 집착, 불안정", "회복, 재정 개선, 새로운 시작", "빚, 이기심, 불평등",
        "조급함, 수확 없음, 잘못된 투자", "무관심, 야망 부족, 품질 저하", "과시, 사기, 재정적 의존",
        "가족 갈등, 재정 분쟁, 유산 문제", "실망스러운 소식, 기회 놓침", "지루함, 게으름, 방향 상실",
        "가정 불안, 자기 돌봄 부족, 낭비", "사업 실패, 재정 손실, 권력 남용"
      ],
    },
  };

  const suitData = suitMeanings[suit];

  return ranks.map((rank, idx) => ({
    id: 22 + (suit === "Wands" ? 0 : suit === "Cups" ? 14 : suit === "Swords" ? 28 : 42) + idx,
    name: `${rank.name} of ${suit}`,
    nameKo: `${suitKo}의 ${rank.nameKo}`,
    suit,
    arcana: "minor" as const,
    emoji: suitEmoji,
    upright: suitData.upright[idx],
    reversed: suitData.reversed[idx],
  }));
}

const minorArcana: TarotCard[] = [
  ...createMinorCards("Wands", "완드", "🪄"),
  ...createMinorCards("Cups", "컵", "🏆"),
  ...createMinorCards("Swords", "소드", "⚔️"),
  ...createMinorCards("Pentacles", "펜타클", "💎"),
];

export const allTarotCards: TarotCard[] = [...majorArcana, ...minorArcana];

export function drawCards(count: number): { card: TarotCard; isReversed: boolean }[] {
  const shuffled = [...allTarotCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card) => ({
    card,
    isReversed: Math.random() > 0.5,
  }));
}

export function getDailyCard(): { card: TarotCard; isReversed: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % allTarotCards.length;
  return { card: allTarotCards[idx], isReversed: (hash & 1) === 0 };
}
