declare global {
  interface Window {
    Kakao: any;
  }
}

let initialized = false;

function initKakao() {
  if (initialized) return;
  const key = import.meta.env.VITE_KAKAO_JS_KEY;
  if (!key || !window.Kakao) return;
  try {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(key);
    }
    initialized = true;
  } catch {
    // ignore
  }
}

export interface KakaoShareOptions {
  title: string;
  description: string;
  imageUrl?: string;
  /** 앱 링크 (앱인토스 딥링크 or 웹 URL) */
  webUrl?: string;
  buttonText?: string;
}

export function shareToKakao(options: KakaoShareOptions): boolean {
  initKakao();
  if (!window.Kakao?.Share) return false;

  try {
    const webUrl = options.webUrl || "https://apps.toss.im/com.toss.goldenface";

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: options.title,
        description: options.description,
        imageUrl: options.imageUrl || "https://apps.toss.im/og-image.png",
        link: {
          mobileWebUrl: webUrl,
          webUrl: webUrl,
        },
      },
      buttons: [
        {
          title: options.buttonText || "나도 확인하기",
          link: {
            mobileWebUrl: webUrl,
            webUrl: webUrl,
          },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/** 카카오 SDK 없을 때 Web Share API 또는 클립보드 복사 fallback */
export async function shareFallback(text: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch {
      // ignore
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    alert("링크가 복사됐어요! 카카오톡에 붙여넣기 해보세요 📋");
  } catch {
    alert("공유하기가 지원되지 않는 환경이에요.");
  }
}

/** 메인 공유 함수: 카카오 → Web Share → 클립보드 순서로 시도 */
export async function shareFortuneResult(options: KakaoShareOptions): Promise<void> {
  const kakaoOk = shareToKakao(options);
  if (!kakaoOk) {
    const shareText = `${options.title}\n${options.description}\n금빛관상에서 확인하세요!`;
    await shareFallback(shareText);
  }
}
