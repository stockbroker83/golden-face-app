// 사주팔자 계산 유틸리티

// 천간 (天干)
export const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;

// 지지 (地支)
export const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

// 오행 (五行)
export enum WuXing {
  Wood = '목(木)',
  Fire = '화(火)',
  Earth = '토(土)',
  Metal = '금(金)',
  Water = '수(水)',
}

// 천간의 오행
const STEM_WUXING: Record<string, WuXing> = {
  '갑': WuXing.Wood, '을': WuXing.Wood,
  '병': WuXing.Fire, '정': WuXing.Fire,
  '무': WuXing.Earth, '기': WuXing.Earth,
  '경': WuXing.Metal, '신': WuXing.Metal,
  '임': WuXing.Water, '계': WuXing.Water,
};

// 지지의 오행
const BRANCH_WUXING: Record<string, WuXing> = {
  '인': WuXing.Wood, '묘': WuXing.Wood,
  '사': WuXing.Fire, '오': WuXing.Fire,
  '진': WuXing.Earth, '술': WuXing.Earth, '축': WuXing.Earth, '미': WuXing.Earth,
  '신': WuXing.Metal, '유': WuXing.Metal,
  '자': WuXing.Water, '해': WuXing.Water,
};

// 십성 (十星)
export enum TenGods {
  BiJian = '비견(比肩)',
  JieCai = '겁재(劫財)',
  ShiShen = '식신(食神)',
  ShangGuan = '상관(傷官)',
  PianCai = '편재(偏財)',
  ZhengCai = '정재(正財)',
  PianGuan = '편관(偏官)',
  ZhengGuan = '정관(正官)',
  PianYin = '편인(偏印)',
  ZhengYin = '정인(正印)',
}

// 12운성
export const TWELVE_FORTUNES = [
  '장생(長生)', '목욕(沐浴)', '관대(冠帶)', '건록(建祿)',
  '제왕(帝旺)', '쇠(衰)', '병(病)', '사(死)',
  '묘(墓)', '절(絕)', '태(胎)', '양(養)'
] as const;

export interface SajuPillar {
  stem: HeavenlyStem;  // 천간
  branch: EarthlyBranch;  // 지지
  combined: string;  // 간지 조합 (예: 갑자)
  stemWuxing: WuXing;  // 천간 오행
  branchWuxing: WuXing;  // 지지 오행
}

export interface FourPillars {
  year: SajuPillar;  // 연주
  month: SajuPillar;  // 월주
  day: SajuPillar;  // 일주
  hour: SajuPillar;  // 시주
  dayMaster: HeavenlyStem;  // 일간 (본인)
  dayMasterWuxing: WuXing;  // 일간 오행
}

export interface WuXingBalance {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  total: number;
  lacking: WuXing[];  // 부족한 오행
  excess: WuXing[];  // 과다한 오행
}

export interface DaeunPeriod {
  startAge: number;
  endAge: number;
  pillar: SajuPillar;
  description: string;
}

// 십성 분석
export interface TenGodsAnalysis {
  year: { stem: TenGods; branch: TenGods };
  month: { stem: TenGods; branch: TenGods };
  day: { stem: TenGods; branch: TenGods };
  hour: { stem: TenGods; branch: TenGods };
  dominant: TenGods[];  // 강한 십성
  lacking: TenGods[];   // 부족한 십성
  interpretation: string;
}

// 십이운성 분석
export interface TwelveStarsAnalysis {
  year: string;
  month: string;
  day: string;
  hour: string;
  strongest: string;  // 가장 강한 운성
  interpretation: string;
}

// 신살 분석
export interface SpiritAnalysis {
  beneficial: Array<{ name: string; description: string; pillar: string }>;  // 길신
  harmful: Array<{ name: string; description: string; pillar: string }>;  // 흉신
  summary: string;
}

// 격국 분석
export interface StructureAnalysis {
  primary: string;  // 주 격국
  secondary?: string;  // 부 격국
  quality: 'excellent' | 'good' | 'moderate' | 'weak';  // 격국 품질
  description: string;
  strengths: string[];
  weaknesses: string[];
}

// 용신 분석
export interface UsefulGodAnalysis {
  primary: WuXing;  // 용신
  secondary: WuXing[];  // 희신
  avoid: WuXing[];  // 기신
  rescue: WuXing;  // 구신
  luckyColors: string[];
  luckyDirections: string[];
  luckyNumbers: number[];
  careerSuggestions: string[];
  seasonalAdvice: string;
}

// 육친 분석
export interface SixRelativesAnalysis {
  father: { strength: number; description: string; pillars: string[] };
  mother: { strength: number; description: string; pillars: string[] };
  siblings: { strength: number; description: string; pillars: string[] };
  spouse: { strength: number; description: string; pillars: string[] };
  children: { strength: number; description: string; pillars: string[] };
  overall: string;
}

// 월운 분석
export interface MonthlyFortuneAnalysis {
  year: number;
  month: number;
  monthPillar: SajuPillar;
  score: number;
  fortune: string;
  opportunities: string[];
  warnings: string[];
  advice: string;
}

export interface SajuAnalysis {
  fourPillars: FourPillars;
  wuxingBalance: WuXingBalance;
  daeun: DaeunPeriod[];
  currentDaeun?: DaeunPeriod;
  yearlyFortune?: string;
  
  // 새로 추가
  tenGods: TenGodsAnalysis;
  twelveStars: TwelveStarsAnalysis;
  spirits: SpiritAnalysis;
  structure: StructureAnalysis;
  usefulGod: UsefulGodAnalysis;
  sixRelatives: SixRelativesAnalysis;
  monthlyFortune: MonthlyFortuneAnalysis[];
}

/**
 * 양력 날짜로부터 천간지지 계산
 * (간단한 알고리즘 사용, 실제로는 만세력 기반 정확도 필요)
 */
function calculateGanZhi(year: number, month: number, day: number, hour: number): FourPillars {
  // 연주 계산 (기준년도 1984년 = 갑자년)
  const yearOffset = (year - 1984) % 60;
  const yearStemIndex = (yearOffset + 0) % 10;
  const yearBranchIndex = (yearOffset + 0) % 12;

  // 월주 계산 (입춘 기준 필요하나 단순화)
  // 월건표: 연간에 따라 시작 월주가 다름
  const monthOffset = month - 1;
  const monthStemIndex = ((yearStemIndex % 5) * 2 + monthOffset + 2) % 10;
  const monthBranchIndex = (monthOffset + 2) % 12;

  // 일주 계산 (기준일 1984-02-04 = 갑자일)
  const baseDate = new Date(1984, 1, 4);  // 갑자일
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayStemIndex = (daysDiff % 60) % 10;
  const dayBranchIndex = (daysDiff % 60) % 12;

  // 시주 계산
  const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
  const hourStemIndex = ((dayStemIndex % 5) * 2 + hourBranchIndex) % 10;

  const createPillar = (stemIdx: number, branchIdx: number): SajuPillar => {
    const stem = HEAVENLY_STEMS[stemIdx < 0 ? stemIdx + 10 : stemIdx];
    const branch = EARTHLY_BRANCHES[branchIdx < 0 ? branchIdx + 12 : branchIdx];
    return {
      stem,
      branch,
      combined: `${stem}${branch}`,
      stemWuxing: STEM_WUXING[stem],
      branchWuxing: BRANCH_WUXING[branch],
    };
  };

  return {
    year: createPillar(yearStemIndex, yearBranchIndex),
    month: createPillar(monthStemIndex, monthBranchIndex),
    day: createPillar(dayStemIndex, dayBranchIndex),
    hour: createPillar(hourStemIndex, hourBranchIndex),
    dayMaster: HEAVENLY_STEMS[dayStemIndex < 0 ? dayStemIndex + 10 : dayStemIndex],
    dayMasterWuxing: STEM_WUXING[HEAVENLY_STEMS[dayStemIndex < 0 ? dayStemIndex + 10 : dayStemIndex]],
  };
}

/**
 * 오행 균형 분석
 */
function analyzeWuXingBalance(fourPillars: FourPillars): WuXingBalance {
  const count = {
    [WuXing.Wood]: 0,
    [WuXing.Fire]: 0,
    [WuXing.Earth]: 0,
    [WuXing.Metal]: 0,
    [WuXing.Water]: 0,
  };

  // 각 주의 천간과 지지 오행 카운트
  [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour].forEach(pillar => {
    count[pillar.stemWuxing] += 1;
    count[pillar.branchWuxing] += 1;
  });

  const total = Object.values(count).reduce((sum, c) => sum + c, 0);
  const average = total / 5;

  // 부족한 오행 (평균의 50% 미만)
  const lacking = Object.entries(count)
    .filter(([_, c]) => c < average * 0.5)
    .map(([wx]) => wx as WuXing);

  // 과다한 오행 (평균의 150% 이상)
  const excess = Object.entries(count)
    .filter(([_, c]) => c > average * 1.5)
    .map(([wx]) => wx as WuXing);

  return {
    wood: count[WuXing.Wood],
    fire: count[WuXing.Fire],
    earth: count[WuXing.Earth],
    metal: count[WuXing.Metal],
    water: count[WuXing.Water],
    total,
    lacking,
    excess,
  };
}

/**
 * 대운 계산 (10년 주기)
 */
function calculateDaeun(fourPillars: FourPillars, gender: 'male' | 'female'): DaeunPeriod[] {
  const daeuns: DaeunPeriod[] = [];
  
  // 양남음녀 순행, 음남양녀 역행
  const yearStemIndex = HEAVENLY_STEMS.indexOf(fourPillars.year.stem);
  const isYang = yearStemIndex % 2 === 0;
  const isForward = (gender === 'male' && isYang) || (gender === 'female' && !isYang);

  let currentStemIndex = HEAVENLY_STEMS.indexOf(fourPillars.month.stem);
  let currentBranchIndex = EARTHLY_BRANCHES.indexOf(fourPillars.month.branch);

  // 대운은 보통 만 5세, 15세, 25세... 등으로 시작
  for (let i = 0; i < 9; i++) {  // 90살까지 9개 대운
    const startAge = 5 + i * 10;
    const endAge = startAge + 9;

    if (isForward) {
      currentStemIndex = (currentStemIndex + 1) % 10;
      currentBranchIndex = (currentBranchIndex + 1) % 12;
    } else {
      currentStemIndex = (currentStemIndex - 1 + 10) % 10;
      currentBranchIndex = (currentBranchIndex - 1 + 12) % 12;
    }

    const stem = HEAVENLY_STEMS[currentStemIndex];
    const branch = EARTHLY_BRANCHES[currentBranchIndex];

    daeuns.push({
      startAge,
      endAge,
      pillar: {
        stem,
        branch,
        combined: `${stem}${branch}`,
        stemWuxing: STEM_WUXING[stem],
        branchWuxing: BRANCH_WUXING[branch],
      },
      description: `${startAge}~${endAge}세: ${stem}${branch}`,
    });
  }

  return daeuns;
}

/**
 * 현재 대운 찾기
 */
function getCurrentDaeun(daeuns: DaeunPeriod[], birthDate: Date): DaeunPeriod | undefined {
  const now = new Date();
  const ageInYears = now.getFullYear() - birthDate.getFullYear();
  
  return daeuns.find(d => ageInYears >= d.startAge && ageInYears <= d.endAge);
}

/**
 * 메인 사주 분석 함수
 */
export function analyzeSaju(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
): SajuAnalysis {
  const fourPillars = calculateGanZhi(year, month, day, hour);
  const wuxingBalance = analyzeWuXingBalance(fourPillars);
  const daeun = calculateDaeun(fourPillars, gender);
  const birthDate = new Date(year, month - 1, day, hour);
  const currentDaeun = getCurrentDaeun(daeun, birthDate);

  // 올해 세운 계산
  const currentYear = new Date().getFullYear();
  const yearOffset = (currentYear - 1984) % 60;
  const yearStemIndex = (yearOffset + 0) % 10;
  const yearBranchIndex = (yearOffset + 0) % 12;
  const yearlyFortune = `${HEAVENLY_STEMS[yearStemIndex]}${EARTHLY_BRANCHES[yearBranchIndex]}년`;

  // 새로운 분석 추가
  const tenGods = analyzeTenGods(fourPillars);
  const twelveStars = analyzeTwelveStars(fourPillars);
  const spirits = analyzeSpirits(fourPillars);
  const structure = analyzeStructure(fourPillars, tenGods);
  const usefulGod = analyzeUsefulGod(fourPillars, wuxingBalance);
  const sixRelatives = analyzeSixRelatives(fourPillars, tenGods, gender);
  const monthlyFortune = analyzeMonthlyFortune(fourPillars, wuxingBalance);

  return {
    fourPillars,
    wuxingBalance,
    daeun,
    currentDaeun,
    yearlyFortune,
    tenGods,
    twelveStars,
    spirits,
    structure,
    usefulGod,
    sixRelatives,
    monthlyFortune,
  };
}

/**
 * 궁합 점수 계산 (간단한 알고리즘)
 */
export function calculateCompatibility(saju1: FourPillars, saju2: FourPillars): {
  score: number;
  description: string;
  details: string[];
} {
  let score = 50;  // 기본 50점
  const details: string[] = [];

  // 일간 상생상극 체크
  const dm1 = saju1.dayMasterWuxing;
  const dm2 = saju2.dayMasterWuxing;

  // 상생 체크 (목생화, 화생토, 토생금, 금생수, 수생목)
  const shengRelations: Record<WuXing, WuXing> = {
    [WuXing.Wood]: WuXing.Fire,
    [WuXing.Fire]: WuXing.Earth,
    [WuXing.Earth]: WuXing.Metal,
    [WuXing.Metal]: WuXing.Water,
    [WuXing.Water]: WuXing.Wood,
  };

  if (shengRelations[dm1] === dm2 || shengRelations[dm2] === dm1) {
    score += 20;
    details.push('✅ 일간이 상생 관계로 서로를 도와줍니다');
  }

  // 같은 오행
  if (dm1 === dm2) {
    score += 10;
    details.push('✅ 일간이 같은 오행으로 이해가 깊습니다');
  }

  // 상극 체크 (목극토, 토극수, 수극화, 화극금, 금극목)
  const keRelations: Record<WuXing, WuXing> = {
    [WuXing.Wood]: WuXing.Earth,
    [WuXing.Earth]: WuXing.Water,
    [WuXing.Water]: WuXing.Fire,
    [WuXing.Fire]: WuXing.Metal,
    [WuXing.Metal]: WuXing.Wood,
  };

  if (keRelations[dm1] === dm2 || keRelations[dm2] === dm1) {
    score -= 15;
    details.push('⚠️ 일간이 상극 관계로 충돌이 있을 수 있습니다');
  }

  // 지지 합 체크 (자축합, 인해합, 묘술합, 진유합, 사신합, 오미합)
  const branchHaps: Record<string, string> = {
    '자': '축', '축': '자',
    '인': '해', '해': '인',
    '묘': '술', '술': '묘',
    '진': '유', '유': '진',
    '사': '신', '신': '사',
    '오': '미', '미': '오',
  };

  let hasHap = false;
  [saju1.year, saju1.month, saju1.day].forEach(p1 => {
    [saju2.year, saju2.month, saju2.day].forEach(p2 => {
      if (branchHaps[p1.branch] === p2.branch) {
        hasHap = true;
      }
    });
  });

  if (hasHap) {
    score += 15;
    details.push('✅ 지지에 합(合)이 있어 서로 끌립니다');
  }

  // 지지 충 체크 (자오충, 축미충, 인신충, 묘유충, 진술충, 사해충)
  const branchChungs: Record<string, string> = {
    '자': '오', '오': '자',
    '축': '미', '미': '축',
    '인': '신', '신': '인',
    '묘': '유', '유': '묘',
    '진': '술', '술': '진',
    '사': '해', '해': '사',
  };

  let hasChung = false;
  [saju1.year, saju1.month, saju1.day].forEach(p1 => {
    [saju2.year, saju2.month, saju2.day].forEach(p2 => {
      if (branchChungs[p1.branch] === p2.branch) {
        hasChung = true;
      }
    });
  });

  if (hasChung) {
    score -= 10;
    details.push('⚠️ 지지에 충(沖)이 있어 갈등이 있을 수 있습니다');
  }

  // 오행 균형 체크
  const balance1 = analyzeWuXingBalance(saju1);
  const balance2 = analyzeWuXingBalance(saju2);

  // 한 사람의 부족한 오행을 다른 사람이 보충해주는지
  let complementary = false;
  balance1.lacking.forEach(lacking => {
    if (balance2.excess.includes(lacking)) {
      complementary = true;
    }
  });
  balance2.lacking.forEach(lacking => {
    if (balance1.excess.includes(lacking)) {
      complementary = true;
    }
  });

  if (complementary) {
    score += 15;
    details.push('✅ 서로의 부족한 오행을 보완해줍니다');
  }

  // 점수 범위 조정
  score = Math.max(0, Math.min(100, score));

  let description = '';
  if (score >= 80) {
    description = '천생연분 💘 매우 좋은 궁합입니다!';
  } else if (score >= 65) {
    description = '잘 어울려요 💕 좋은 궁합입니다';
  } else if (score >= 50) {
    description = '무난해요 😊 노력하면 좋은 관계를 유지할 수 있습니다';
  } else if (score >= 35) {
    description = '조심스러워요 😐 서로 이해하려는 노력이 필요합니다';
  } else {
    description = '어려워요 😔 많은 노력과 이해가 필요합니다';
  }

  return { score, description, details };
}

/**
 * 사주 데이터를 텍스트로 포맷팅 (Gemini 프롬프트용)
 */
export function formatSajuForPrompt(analysis: SajuAnalysis): string {
  const { fourPillars, wuxingBalance, currentDaeun, yearlyFortune } = analysis;

  return `
사주팔자 정보:
- 연주(年柱): ${fourPillars.year.combined} (${fourPillars.year.stemWuxing}, ${fourPillars.year.branchWuxing})
- 월주(月柱): ${fourPillars.month.combined} (${fourPillars.month.stemWuxing}, ${fourPillars.month.branchWuxing})
- 일주(日柱): ${fourPillars.day.combined} (${fourPillars.day.stemWuxing}, ${fourPillars.day.branchWuxing})
- 시주(時柱): ${fourPillars.hour.combined} (${fourPillars.hour.stemWuxing}, ${fourPillars.hour.branchWuxing})
- 일간(日干): ${fourPillars.dayMaster} (${fourPillars.dayMasterWuxing})

오행 균형:
- 목(木): ${wuxingBalance.wood}
- 화(火): ${wuxingBalance.fire}
- 토(土): ${wuxingBalance.earth}
- 금(金): ${wuxingBalance.metal}
- 수(水): ${wuxingBalance.water}
${wuxingBalance.lacking.length > 0 ? `- 부족: ${wuxingBalance.lacking.join(', ')}` : ''}
${wuxingBalance.excess.length > 0 ? `- 과다: ${wuxingBalance.excess.join(', ')}` : ''}

${currentDaeun ? `현재 대운: ${currentDaeun.pillar.combined} (${currentDaeun.description})` : ''}
올해 세운: ${yearlyFortune}
`.trim();
}

// ==========================================
// 십성(十星) 계산
// ==========================================

/**
 * 일간과 타 천간의 관계로 십성 계산
 */
function calculateTenGod(dayMaster: HeavenlyStem, target: HeavenlyStem): TenGods {
  const dmIndex = HEAVENLY_STEMS.indexOf(dayMaster);
  const tgIndex = HEAVENLY_STEMS.indexOf(target);
  
  const dmYinYang = dmIndex % 2;  // 0=양, 1=음
  const tgYinYang = tgIndex % 2;
  
  const dmWuxing = STEM_WUXING[dayMaster];
  const tgWuxing = STEM_WUXING[target];
  
  // 같은 오행
  if (dmWuxing === tgWuxing) {
    return dmYinYang === tgYinYang ? TenGods.BiJian : TenGods.JieCai;
  }
  
  // 일간이 생하는 오행 (식신/상관)
  const shengRelations: Record<WuXing, WuXing> = {
    [WuXing.Wood]: WuXing.Fire,
    [WuXing.Fire]: WuXing.Earth,
    [WuXing.Earth]: WuXing.Metal,
    [WuXing.Metal]: WuXing.Water,
    [WuXing.Water]: WuXing.Wood,
  };
  
  if (shengRelations[dmWuxing] === tgWuxing) {
    return dmYinYang === tgYinYang ? TenGods.ShiShen : TenGods.ShangGuan;
  }
  
  // 일간이 극하는 오행 (편재/정재)
  const keRelations: Record<WuXing, WuXing> = {
    [WuXing.Wood]: WuXing.Earth,
    [WuXing.Earth]: WuXing.Water,
    [WuXing.Water]: WuXing.Fire,
    [WuXing.Fire]: WuXing.Metal,
    [WuXing.Metal]: WuXing.Wood,
  };
  
  if (keRelations[dmWuxing] === tgWuxing) {
    return dmYinYang === tgYinYang ? TenGods.PianCai : TenGods.ZhengCai;
  }
  
  // 일간을 극하는 오행 (편관/정관)
  let isGrammedBy = false;
  for (const [k, v] of Object.entries(keRelations)) {
    if (k === tgWuxing && v === dmWuxing) {
      isGrammedBy = true;
      break;
    }
  }
  
  if (isGrammedBy) {
    return dmYinYang === tgYinYang ? TenGods.PianGuan : TenGods.ZhengGuan;
  }
  
  // 일간을 생하는 오행 (편인/정인)
  return dmYinYang === tgYinYang ? TenGods.PianYin : TenGods.ZhengYin;
}

/**
 * 지지의 장간(藏干)에서 대표 천간 추출
 */
function getHiddenStem(branch: EarthlyBranch): HeavenlyStem {
  const hiddenStems: Record<EarthlyBranch, HeavenlyStem> = {
    '자': '계', '축': '기', '인': '갑', '묘': '을',
    '진': '무', '사': '병', '오': '정', '미': '기',
    '신': '경', '유': '신', '술': '무', '해': '임'
  };
  return hiddenStems[branch];
}

function analyzeTenGods(fourPillars: FourPillars): TenGodsAnalysis {
  const dm = fourPillars.dayMaster;
  
  const yearStemGod = calculateTenGod(dm, fourPillars.year.stem);
  const monthStemGod = calculateTenGod(dm, fourPillars.month.stem);
  const dayStemGod = TenGods.BiJian;  // 일간 자체
  const hourStemGod = calculateTenGod(dm, fourPillars.hour.stem);
  
  const yearBranchGod = calculateTenGod(dm, getHiddenStem(fourPillars.year.branch));
  const monthBranchGod = calculateTenGod(dm, getHiddenStem(fourPillars.month.branch));
  const dayBranchGod = calculateTenGod(dm, getHiddenStem(fourPillars.day.branch));
  const hourBranchGod = calculateTenGod(dm, getHiddenStem(fourPillars.hour.branch));
  
  const allGods = [
    yearStemGod, monthStemGod, hourStemGod,
    yearBranchGod, monthBranchGod, dayBranchGod, hourBranchGod
  ];
  
  const godCounts = new Map<TenGods, number>();
  allGods.forEach(god => {
    godCounts.set(god, (godCounts.get(god) || 0) + 1);
  });
  
  const sorted = Array.from(godCounts.entries()).sort((a, b) => b[1] - a[1]);
  const dominant = sorted.slice(0, 2).map(([god]) => god);
  
  const allTenGods = Object.values(TenGods);
  const lacking = allTenGods.filter(god => !godCounts.has(god));
  
  let interpretation = `사주에 ${dominant.map(g => g).join(', ')}이(가) 강합니다. `;
  if (dominant.includes(TenGods.ZhengGuan) || dominant.includes(TenGods.PianGuan)) {
    interpretation += '관성이 강해 직장운과 명예운이 좋습니다.';
  } else if (dominant.includes(TenGods.ZhengCai) || dominant.includes(TenGods.PianCai)) {
    interpretation += '재성이 강해 재물운이 좋습니다.';
  }
  
  return {
    year: { stem: yearStemGod, branch: yearBranchGod },
    month: { stem: monthStemGod, branch: monthBranchGod },
    day: { stem: dayStemGod, branch: dayBranchGod },
    hour: { stem: hourStemGod, branch: hourBranchGod },
    dominant,
    lacking,
    interpretation
  };
}

// ==========================================
// 십이운성(十二運星) 계산
// ==========================================

function calculateTwelveStar(dayMaster: HeavenlyStem, branch: EarthlyBranch): string {
  // 십이운성표 (간략화)
  const twelveStarTable: Record<HeavenlyStem, Record<EarthlyBranch, string>> = {
    '갑': { '자': '태(胎)', '축': '양(養)', '인': '장생(長生)', '묘': '목욕(沐浴)', 
           '진': '관대(冠帶)', '사': '건록(建祿)', '오': '제왕(帝旺)', '미': '쇠(衰)',
           '신': '병(病)', '유': '사(死)', '술': '묘(墓)', '해': '절(絕)' },
    '을': { '자': '절(絕)', '축': '묘(墓)', '인': '사(死)', '묘': '병(病)',
           '진': '쇠(衰)', '사': '제왕(帝旺)', '오': '건록(建祿)', '미': '관대(冠帶)',
           '신': '목욕(沐浴)', '유': '장생(長生)', '술': '양(養)', '해': '태(胎)' },
    '병': { '자': '병(病)', '축': '묘(墓)', '인': '장생(長生)', '묘': '목욕(沐浴)',
           '진': '관대(冠帶)', '사': '건록(建祿)', '오': '제왕(帝旺)', '미': '쇠(衰)',
           '신': '사(死)', '유': '절(絕)', '술': '태(胎)', '해': '양(養)' },
    '정': { '자': '양(養)', '축': '태(胎)', '인': '절(絕)', '묘': '사(死)',
           '진': '병(病)', '사': '제왕(帝旺)', '오': '건록(建祿)', '미': '관대(冠帶)',
           '신': '목욕(沐浴)', '유': '장생(長生)', '술': '묘(墓)', '해': '쇠(衰)' },
    '무': { '자': '병(病)', '축': '묘(墓)', '인': '장생(長生)', '묘': '목욕(沐浴)',
           '진': '관대(冠帶)', '사': '건록(建祿)', '오': '제왕(帝旺)', '미': '쇠(衰)',
           '신': '사(死)', '유': '절(絕)', '술': '태(胎)', '해': '양(養)' },
    '기': { '자': '양(養)', '축': '태(胎)', '인': '절(絕)', '묘': '사(死)',
           '진': '병(病)', '사': '제왕(帝旺)', '오': '건록(建祿)', '미': '관대(冠帶)',
           '신': '목욕(沐浴)', '유': '장생(長生)', '술': '묘(墓)', '해': '쇠(衰)' },
    '경': { '자': '사(死)', '축': '묘(墓)', '인': '절(絕)', '묘': '태(胎)',
           '진': '양(養)', '사': '장생(長生)', '오': '목욕(沐浴)', '미': '관대(冠帶)',
           '신': '건록(建祿)', '유': '제왕(帝旺)', '술': '쇠(衰)', '해': '병(病)' },
    '신': { '자': '병(病)', '축': '쇠(衰)', '인': '태(胎)', '묘': '양(養)',
           '진': '절(絕)', '사': '사(死)', '오': '묘(墓)', '미': '목욕(沐浴)',
           '신': '제왕(帝旺)', '유': '건록(建祿)', '술': '관대(冠帶)', '해': '장생(長生)' },
    '임': { '자': '제왕(帝旺)', '축': '묘(墓)', '인': '병(病)', '묘': '사(死)',
           '진': '묘(墓)', '사': '절(絕)', '오': '태(胎)', '미': '양(養)',
           '신': '장생(長生)', '유': '목욕(沐浴)', '술': '관대(冠帶)', '해': '건록(建祿)' },
    '계': { '자': '건록(建祿)', '축': '관대(冠帶)', '인': '쇠(衰)', '묘': '병(病)',
           '진': '묘(墓)', '사': '태(胎)', '오': '절(絕)', '미': '양(養)',
           '신': '사(死)', '유': '장생(長生)', '술': '목욕(沐浴)', '해': '제왕(帝旺)' },
  };
  
  return twelveStarTable[dayMaster]?.[branch] || '장생(長生)';
}

function analyzeTwelveStars(fourPillars: FourPillars): TwelveStarsAnalysis {
  const dm = fourPillars.dayMaster;
  
  const year = calculateTwelveStar(dm, fourPillars.year.branch);
  const month = calculateTwelveStar(dm, fourPillars.month.branch);
  const day = calculateTwelveStar(dm, fourPillars.day.branch);
  const hour = calculateTwelveStar(dm, fourPillars.hour.branch);
  
  const stars = [year, month, day, hour];
  const strongStars = ['장생(長生)', '건록(建祿)', '제왕(帝旺)'];
  const strongest = stars.find(s => strongStars.includes(s)) || day;
  
  let interpretation = `십이운성 중 ${strongest}의 기운이 있어 `;
  if (strongest.includes('제왕')) {
    interpretation += '왕성한 에너지와 리더십을 발휘합니다.';
  } else if (strongest.includes('장생')) {
    interpretation += '생명력이 풍부하고 시작운이 좋습니다.';
  } else if (strongest.includes('건록')) {
    interpretation += '안정적이고 성실한 성격을 지녔습니다.';
  } else {
    interpretation += '조화롭게 발전해 나갑니다.';
  }
  
  return { year, month, day, hour, strongest, interpretation };
}

// ==========================================
// 신살(神殺) 분석
// ==========================================

function analyzeSpirits(fourPillars: FourPillars): SpiritAnalysis {
  const beneficial: Array<{ name: string; description: string; pillar: string }> = [];
  const harmful: Array<{ name: string; description: string; pillar: string }> = [];
  
  const dm = fourPillars.dayMaster;
  const yearBranch = fourPillars.year.branch;
  const dayBranch = fourPillars.day.branch;
  
  // 천을귀인 (길신)
  const tianYiTable: Record<HeavenlyStem, EarthlyBranch[]> = {
    '갑': ['축', '미'], '을': ['자', '신'], '병': ['해', '유'],
    '정': ['해', '유'], '무': ['축', '미'], '기': ['자', '신'],
    '경': ['축', '미'], '신': ['자', '신'], '임': ['사', '묘'],
    '계': ['사', '묘']
  };
  
  const tianYiBranches = tianYiTable[dm] || [];
  [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour].forEach((pillar, idx) => {
    if (tianYiBranches.includes(pillar.branch)) {
      beneficial.push({
        name: '천을귀인',
        description: '귀인의 도움을 받아 위기를 극복하고 성공합니다',
        pillar: ['연주', '월주', '일주', '시주'][idx]
      });
    }
  });
  
  // 도화살 (일부 흉신으로 여겨짐)
  const doHwaTable: Record<string, EarthlyBranch> = {
    '자': '유', '오': '묘', '묘': '자', '유': '오',
    '인': '해', '사': '신', '신': '사', '해': '인',
    '진': '유', '술': '묘', '축': '자', '미': '오'
  };
  
  const doHwaBranch = doHwaTable[dayBranch];
  [fourPillars.year, fourPillars.month, fourPillars.hour].forEach((pillar, idx) => {
    if (pillar.branch === doHwaBranch) {
      harmful.push({
        name: '도화살',
        description: '이성운이 강하나 감정적 혼란 주의',
        pillar: ['연주', '월주', '시주'][idx]
      });
    }
  });
  
  // 역마살
  const yeokmaSalTable: Record<string, EarthlyBranch> = {
    '인': '신', '오': '인', '술': '신',
    '신': '인', '자': '신', '진': '인',
    '사': '해', '유': '사', '축': '해',
    '해': '사', '묘': '해', '미': '사'
  };
  
  const yeokmaBranch = yeokmaSalTable[dayBranch];
  [fourPillars.year, fourPillars.month, fourPillars.hour].forEach((pillar, idx) => {
    if (pillar.branch === yeokmaBranch) {
      beneficial.push({
        name: '역마살',
        description: '이동수가 많고 해외운이 있습니다',
        pillar: ['연주', '월주', '시주'][idx]
      });
    }
  });
  
  let summary = '';
  if (beneficial.length > harmful.length) {
    summary = '길신이 강해 귀인의 도움과 좋은 기회가 많습니다.';
  } else if (harmful.length > beneficial.length) {
    summary = '흉신이 있으나 노력으로 극복 가능합니다.';
  } else {
    summary = '길흉이 조화를 이루고 있습니다.';
  }
  
  return { beneficial, harmful, summary };
}

// ==========================================
// 격국(格局) 판단
// ==========================================

function analyzeStructure(fourPillars: FourPillars, tenGods: TenGodsAnalysis): StructureAnalysis {
  const dominant = tenGods.dominant;
  
  let primary = '일반격';
  let quality: 'excellent' | 'good' | 'moderate' | 'weak' = 'moderate';
  let description = '';
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // 정격 판단
  if (dominant.includes(TenGods.ZhengGuan)) {
    primary = '정관격';
    quality = 'excellent';
    description = '정관격은 공직이나 정통 사업에서 성공하는 격국입니다.';
    strengths.push('명예와 지위 획득', '조직생활 적합', '책임감');
    weaknesses.push('관성 과다시 압박감');
  } else if (dominant.includes(TenGods.ZhengCai)) {
    primary = '정재격';
    quality = 'good';
    description = '정재격은 안정적인 재물운을 지닌 격국입니다.';
    strengths.push('재물 관리 능력', '성실함', '안정성');
    weaknesses.push('소극적일 수 있음');
  } else if (dominant.includes(TenGods.ZhengYin)) {
    primary = '정인격';
    quality = 'good';
    description = '정인격은 학문과 문서운이 뛰어난 격국입니다.';
    strengths.push('학습 능력', '지혜', '인덕');
    weaknesses.push('의지박약 가능');
  } else if (dominant.includes(TenGods.ShiShen)) {
    primary = '식신격';
    quality = 'good';
    description = '식신격은 창의력과 표현력이 뛰어난 격국입니다.';
    strengths.push('창의성', '예술적 재능', '낙천성');
    weaknesses.push('산만할 수 있음');
  } else if (dominant.includes(TenGods.PianCai)) {
    primary = '편재격';
    quality = 'good';
    description = '편재격은 유동적 재물운이 강한 격국입니다.';
    strengths.push('사업 수완', '활동성', '재치');
    weaknesses.push('불안정성');
  } else if (dominant.includes(TenGods.BiJian)) {
    primary = '비견격';
    quality = 'moderate';
    description = '비견격은 독립심과 자존심이 강한 격국입니다.';
    strengths.push('독립성', '추진력', '자존심');
    weaknesses.push('고집', '형제 간 불화');
  }
  
  return { primary, quality, description, strengths, weaknesses };
}

// ==========================================
// 용신(用神) 추론
// ==========================================

function analyzeUsefulGod(fourPillars: FourPillars, wuxingBalance: WuXingBalance): UsefulGodAnalysis {
  const dm = fourPillars.dayMasterWuxing;
  const lacking = wuxingBalance.lacking;
  const excess = wuxingBalance.excess;
  
  // 기본 용신: 부족한 오행
  let primary: WuXing = lacking[0] || dm;
  const secondary: WuXing[] = lacking.slice(1, 3);
  const avoid: WuXing[] = excess;
  
  // 계절 보정 (간략화)
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) {  // 봄 (木王)
    if (dm === WuXing.Wood) primary = WuXing.Metal;  // 목일간은 금으로 조절
  } else if (month >= 6 && month <= 8) {  // 여름 (火王)
    if (dm === WuXing.Fire) primary = WuXing.Water;
  } else if (month >= 9 && month <= 11) {  // 가을 (金王)
    if (dm === WuXing.Metal) primary = WuXing.Fire;
  } else {  // 겨울 (水王)
    if (dm === WuXing.Water) primary = WuXing.Earth;
  }
  
  const rescue = primary;  // 구신 = 용신
  
  const colorMap: Record<WuXing, string[]> = {
    [WuXing.Wood]: ['초록색', '청색'],
    [WuXing.Fire]: ['빨간색', '주황색', '분홍색'],
    [WuXing.Earth]: ['노란색', '갈색', '베이지'],
    [WuXing.Metal]: ['흰색', '금색', '은색'],
    [WuXing.Water]: ['검은색', '파란색', '회색']
  };
  
  const directionMap: Record<WuXing, string[]> = {
    [WuXing.Wood]: ['동쪽', '동남쪽'],
    [WuXing.Fire]: ['남쪽'],
    [WuXing.Earth]: ['중앙', '남서쪽'],
    [WuXing.Metal]: ['서쪽', '북서쪽'],
    [WuXing.Water]: ['북쪽']
  };
  
  const numberMap: Record<WuXing, number[]> = {
    [WuXing.Wood]: [3, 8],
    [WuXing.Fire]: [2, 7],
    [WuXing.Earth]: [5, 10],
    [WuXing.Metal]: [4, 9],
    [WuXing.Water]: [1, 6]
  };
  
  const careerMap: Record<WuXing, string[]> = {
    [WuXing.Wood]: ['교육', '출판', '의료', '환경'],
    [WuXing.Fire]: ['IT', '전기', '광고', '예술'],
    [WuXing.Earth]: ['부동산', '건축', '농업', '요식업'],
    [WuXing.Metal]: ['금융', '법률', '기계', '무역'],
    [WuXing.Water]: ['운송', '물류', '관광', '수산업']
  };
  
  const luckyColors = colorMap[primary];
  const luckyDirections = directionMap[primary];
  const luckyNumbers = numberMap[primary];
  const careerSuggestions = careerMap[primary];
  
  let seasonalAdvice = '';
  if (month >= 3 && month <= 5) {
    seasonalAdvice = '봄철이니 목기운을 조절하세요.';
  } else if (month >= 6 && month <= 8) {
    seasonalAdvice = '여름철이니 화기운을 조절하세요.';
  } else if (month >= 9 && month <= 11) {
    seasonalAdvice = '가을철이니 금기운을 조절하세요.';
  } else {
    seasonalAdvice = '겨울철이니 수기운을 조절하세요.';
  }
  
  return {
    primary,
    secondary,
    avoid,
    rescue,
    luckyColors,
    luckyDirections,
    luckyNumbers,
    careerSuggestions,
    seasonalAdvice
  };
}

// ==========================================
// 육친(六親) 분석
// ==========================================

function analyzeSixRelatives(fourPillars: FourPillars, tenGods: TenGodsAnalysis, gender: 'male' | 'female'): SixRelativesAnalysis {
  const allGods = [
    tenGods.year.stem, tenGods.year.branch,
    tenGods.month.stem, tenGods.month.branch,
    tenGods.day.stem, tenGods.day.branch,
    tenGods.hour.stem, tenGods.hour.branch
  ];
  
  const countGod = (god: TenGods) => allGods.filter(g => g === god).length;
  
  // 성별에 따라 다름
  let fatherGods: TenGods[], motherGods: TenGods[], spouseGods: TenGods[], childrenGods: TenGods[];
  const siblingsGods: TenGods[] = [TenGods.BiJian, TenGods.JieCai];
  
  if (gender === 'male') {
    fatherGods = [TenGods.PianCai];
    motherGods = [TenGods.ZhengYin];
    spouseGods = [TenGods.ZhengCai];
    childrenGods = [TenGods.ShangGuan];
  } else {
    fatherGods = [TenGods.PianCai];
    motherGods = [TenGods.ZhengYin];
    spouseGods = [TenGods.ZhengGuan];
    childrenGods = [TenGods.ShiShen];
  }
  
  const calcStrength = (gods: TenGods[]): number => {
    const count = gods.reduce((sum, g) => sum + countGod(g), 0);
    return Math.min(100, count * 25);
  };
  
  const father = {
    strength: calcStrength(fatherGods),
    description: calcStrength(fatherGods) > 50 ? '부친과의 인연이 깊습니다' : '부친과의 교류가 적을 수 있습니다',
    pillars: fatherGods.map(g => g).filter(g => countGod(g) > 0)
  };
  
  const mother = {
    strength: calcStrength(motherGods),
    description: calcStrength(motherGods) > 50 ? '모친의 영향을 많이 받습니다' : '모친과의 인연이 보통입니다',
    pillars: motherGods.map(g => g).filter(g => countGod(g) > 0)
  };
  
  const siblings = {
    strength: calcStrength(siblingsGods),
    description: calcStrength(siblingsGods) > 50 ? '형제자매와 경쟁 또는 협력 관계' : '형제인연이 약할 수 있습니다',
    pillars: siblingsGods.map(g => g).filter(g => countGod(g) > 0)
  };
  
  const spouse = {
    strength: calcStrength(spouseGods),
    description: calcStrength(spouseGods) > 50 ? '배우자운이 좋습니다' : '배우자를 만나는데 시간이 걸릴 수 있습니다',
    pillars: spouseGods.map(g => g).filter(g => countGod(g) > 0)
  };
  
  const children = {
    strength: calcStrength(childrenGods),
    description: calcStrength(childrenGods) > 50 ? '자녀운이 좋습니다' : '자녀운이 보통입니다',
    pillars: childrenGods.map(g => g).filter(g => countGod(g) > 0)
  };
  
  const overall = '가족과의 인연이 비교적 조화롭습니다.';
  
  return { father, mother, siblings, spouse, children, overall };
}

// ==========================================
// 월운(月運) 분석
// ==========================================

function analyzeMonthlyFortune(fourPillars: FourPillars, wuxingBalance: WuXingBalance): MonthlyFortuneAnalysis[] {
  const currentYear = new Date().getFullYear();
  const monthlyFortunes: MonthlyFortuneAnalysis[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthOffset = month - 1;
    const yearStemIndex = HEAVENLY_STEMS.indexOf(fourPillars.year.stem);
    const monthStemIndex = ((yearStemIndex % 5) * 2 + monthOffset + 2) % 10;
    const monthBranchIndex = (monthOffset + 2) % 12;
    
    const stem = HEAVENLY_STEMS[monthStemIndex];
    const branch = EARTHLY_BRANCHES[monthBranchIndex];
    
    const monthPillar: SajuPillar = {
      stem,
      branch,
      combined: `${stem}${branch}`,
      stemWuxing: STEM_WUXING[stem],
      branchWuxing: BRANCH_WUXING[branch]
    };
    
    // 월운과 일간의 조화도 계산 (간략)
    let score = 50;
    const dmWuxing = fourPillars.dayMasterWuxing;
    
    // 상생
    const shengRelations: Record<WuXing, WuXing> = {
      [WuXing.Wood]: WuXing.Fire,
      [WuXing.Fire]: WuXing.Earth,
      [WuXing.Earth]: WuXing.Metal,
      [WuXing.Metal]: WuXing.Water,
      [WuXing.Water]: WuXing.Wood,
    };
    
    if (shengRelations[dmWuxing] === monthPillar.stemWuxing || 
        shengRelations[monthPillar.stemWuxing] === dmWuxing) {
      score += 20;
    }
    
    // 부족한 오행 보충
    if (wuxingBalance.lacking.includes(monthPillar.stemWuxing)) {
      score += 15;
    }
    
    // 과다한 오행 충돌
    if (wuxingBalance.excess.includes(monthPillar.stemWuxing)) {
      score -= 15;
    }
    
    score = Math.max(0, Math.min(100, score));
    
    let fortune = '';
    const opportunities: string[] = [];
    const warnings: string[] = [];
    let advice = '';
    
    if (score >= 75) {
      fortune = '매우 좋은 운세';
      opportunities.push('새로운 시작', '재물운 상승', '인간관계 확장');
      advice = '적극적으로 행동하세요';
    } else if (score >= 60) {
      fortune = '좋은 운세';
      opportunities.push('안정적 발전', '협력 기회');
      advice = '꾸준히 노력하세요';
    } else if (score >= 40) {
      fortune = '보통 운세';
      opportunities.push('현 상태 유지');
      warnings.push('급한 결정 자제');
      advice = '신중하게 행동하세요';
    } else {
      fortune = '주의 필요';
      warnings.push('갈등 주의', '재물 손실 가능');
      advice = '방어적으로 대처하세요';
    }
    
    monthlyFortunes.push({
      year: currentYear,
      month,
      monthPillar,
      score,
      fortune,
      opportunities,
      warnings,
      advice
    });
  }
  
  return monthlyFortunes;
}
