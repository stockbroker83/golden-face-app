interface SharePayload {
  title: string;
  text: string;
  imageBlob: Blob;
  fileName?: string;
}

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

export async function shareResult(payload: SharePayload): Promise<boolean> {
  const tossShared = await tryTossShare(payload);
  const webShared = tossShared ? true : await tryWebShare(payload);

  if (!tossShared && !webShared) {
    downloadFallback(payload);
  }

  return tossShared || webShared;
}
