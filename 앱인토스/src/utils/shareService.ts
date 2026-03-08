import { addPoints, loadPoints, savePoints } from "./pointsManager";
import { PointsData } from "../types";

interface SharePayload {
  title: string;
  text: string;
  imageBlob: Blob;
  fileName?: string;
}

const DEFAULT_POINTS: PointsData = {
  total_points: 0,
  today_earned: 0,
  streak_days: 0,
  last_daily_claim: "",
  history: [],
};

async function tryTossShare(payload: SharePayload): Promise<boolean> {
  try {
    const tossModule = (await import("@apps-in-toss/web-framework")) as any;
    const maybeShare = tossModule?.share;
    if (typeof maybeShare === "function") {
      await maybeShare({
        title: payload.title,
        text: payload.text,
      });
      return true;
    }
  } catch {
    // ignore
  }

  try {
    const globalShare = (window as any)?.TossWebView?.share || (window as any)?.Toss?.share;
    if (typeof globalShare === "function") {
      await globalShare({ title: payload.title, text: payload.text });
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

async function tryWebShare(payload: SharePayload): Promise<boolean> {
  const file = new File([payload.imageBlob], payload.fileName || "golden-face-share.jpg", {
    type: "image/jpeg",
  });

  if (!navigator.share) return false;

  try {
    const canUseFiles = (navigator as any).canShare?.({ files: [file] });
    if (canUseFiles) {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        files: [file],
      });
      return true;
    }

    await navigator.share({
      title: payload.title,
      text: payload.text,
    });
    return true;
  } catch {
    return false;
  }
}

function downloadFallback(payload: SharePayload) {
  const url = URL.createObjectURL(payload.imageBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.fileName || `golden-face-share-${Date.now()}.jpg`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function awardSharePoints() {
  const current = loadPoints() || DEFAULT_POINTS;
  const updated = addPoints(current, 5, "결과 공유", "📤");
  savePoints(updated);
}

export async function shareResult(payload: SharePayload): Promise<boolean> {
  const tossShared = await tryTossShare(payload);
  const webShared = tossShared ? true : await tryWebShare(payload);

  if (!tossShared && !webShared) {
    downloadFallback(payload);
  }

  awardSharePoints();
  return tossShared || webShared;
}
