export type OGImageType = "face" | "compatibility" | "psych";

export interface OGImageOptions {
  type: OGImageType;
  title: string;
  subtitle: string;
  scoreText?: string;
  highlights: string[];
  shareUrl?: string;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawQrToCanvas(target: HTMLCanvasElement, shareUrl: string) {
  const safeUrl = encodeURIComponent(shareUrl);
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${safeUrl}`;
  try {
    const qrImage = await loadImage(qrApi);
    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(qrImage, target.width - 150, target.height - 150, 120, 120);
  } catch {
    const ctx = target.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#111827";
    ctx.fillRect(target.width - 150, target.height - 150, 120, 120);
    ctx.fillStyle = "#f9fafb";
    ctx.font = "12px sans-serif";
    ctx.fillText("QR", target.width - 98, target.height - 84);
  }
}

export async function generateOGImage(options: OGImageOptions): Promise<Blob> {
  const { default: html2canvas } = await import("html2canvas");

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = "1200px";
  wrapper.style.height = "630px";
  wrapper.style.padding = "40px";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.background = "linear-gradient(135deg, #1f2937 0%, #4f46e5 55%, #8b5cf6 100%)";
  wrapper.style.color = "white";
  wrapper.style.fontFamily = "'Noto Sans KR', sans-serif";

  const badge = document.createElement("div");
  badge.textContent = options.type === "face" ? "관상 리포트" : options.type === "compatibility" ? "궁합 리포트" : "심리테스트 리포트";
  badge.style.display = "inline-block";
  badge.style.padding = "8px 14px";
  badge.style.borderRadius = "999px";
  badge.style.background = "rgba(255,255,255,0.18)";
  badge.style.fontSize = "20px";
  badge.style.fontWeight = "700";

  const title = document.createElement("h1");
  title.textContent = options.title;
  title.style.margin = "20px 0 8px";
  title.style.fontSize = "56px";
  title.style.lineHeight = "1.2";

  const subtitle = document.createElement("p");
  subtitle.textContent = options.subtitle;
  subtitle.style.margin = "0";
  subtitle.style.fontSize = "28px";
  subtitle.style.opacity = "0.95";

  const score = document.createElement("div");
  score.textContent = options.scoreText || "";
  score.style.marginTop = "24px";
  score.style.fontSize = "40px";
  score.style.fontWeight = "800";

  const list = document.createElement("ul");
  list.style.margin = "22px 0 0";
  list.style.padding = "0";
  list.style.listStyle = "none";
  list.style.display = "grid";
  list.style.gap = "10px";

  options.highlights.slice(0, 4).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `• ${item}`;
    li.style.fontSize = "22px";
    li.style.opacity = "0.95";
    list.appendChild(li);
  });

  const watermark = document.createElement("div");
  watermark.textContent = "금빛관상 · Golden Face";
  watermark.style.position = "absolute";
  watermark.style.bottom = "26px";
  watermark.style.left = "40px";
  watermark.style.fontSize = "20px";
  watermark.style.opacity = "0.8";

  wrapper.appendChild(badge);
  wrapper.appendChild(title);
  wrapper.appendChild(subtitle);
  wrapper.appendChild(score);
  wrapper.appendChild(list);
  wrapper.appendChild(watermark);
  document.body.appendChild(wrapper);

  const renderedCanvas = await html2canvas(wrapper, {
    backgroundColor: null,
    width: 1200,
    height: 630,
    scale: 1,
    useCORS: true,
  });

  if (options.shareUrl) {
    await drawQrToCanvas(renderedCanvas, options.shareUrl);
  }

  document.body.removeChild(wrapper);

  return new Promise((resolve, reject) => {
    renderedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("공유 이미지 생성 실패"));
        return;
      }
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}
