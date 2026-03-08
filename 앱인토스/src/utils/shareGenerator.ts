import type { FreeAnalysisResult } from '../types';

export async function generateShareImage(
  faceAnalysis: FreeAnalysisResult,
  imageFile: string
): Promise<Blob> {
  
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  
  const ctx = canvas.getContext('2d')!;
  
  // 배경 그라데이션
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);
  
  // 얼굴 이미지
  const img = new Image();
  img.src = imageFile;
  await new Promise((resolve) => { img.onload = resolve; });
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(300, 315, 150, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 150, 165, 300, 300);
  ctx.restore();
  
  // 원형 테두리
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(300, 315, 150, 0, Math.PI * 2);
  ctx.stroke();
  
  // 텍스트
  ctx.fillStyle = 'white';
  ctx.font = 'bold 60px Noto Sans KR, sans-serif';
  ctx.fillText(`나의 관상 점수: ${faceAnalysis.overall_score}점`, 500, 230);
  
  ctx.font = '45px Noto Sans KR, sans-serif';
  ctx.fillText(faceAnalysis.face_type, 500, 300);
  
  ctx.font = '35px Noto Sans KR, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  const impression = faceAnalysis.overall_impression.substring(0, 30) + '...';
  ctx.fillText(impression, 500, 360);
  
  ctx.font = 'bold 30px Noto Sans KR, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('🌟 금빛관상에서 무료로 확인하기', 500, 450);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
  });
}

// Web Share API (iOS/Android)
export async function shareNative(shareImage: Blob, analysis: FreeAnalysisResult) {
  if (!navigator.share) {
    alert('이 기기에서는 공유 기능을 사용할 수 없습니다.');
    return false;
  }

  const file = new File([shareImage], 'golden-face.jpg', { type: 'image/jpeg' });

  try {
    await navigator.share({
      title: `나의 관상 점수: ${analysis.overall_score}점`,
      text: `${analysis.face_type} - 금빛관상에서 무료 분석 받기!`,
      files: [file],
    });
    return true;
  } catch (error) {
    console.log('공유 취소:', error);
    return false;
  }
}

// 이미지 다운로드
export function downloadShareImage(shareImage: Blob) {
  const url = URL.createObjectURL(shareImage);
  const a = document.createElement('a');
  a.href = url;
  a.download = `금빛관상_${Date.now()}.jpg`;
  a.click();
  URL.revokeObjectURL(url);
}
