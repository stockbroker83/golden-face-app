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

export interface SajuAnalysis {
  fourPillars: FourPillars;
  wuxingBalance: WuXingBalance;
  daeun: DaeunPeriod[];  // 대운 (10년 주기)
  currentDaeun?: DaeunPeriod;  // 현재 대운
  yearlyFortune?: string;  // 올해 세운
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

  return {
    fourPillars,
    wuxingBalance,
    daeun,
    currentDaeun,
    yearlyFortune,
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
