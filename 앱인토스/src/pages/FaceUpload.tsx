import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/Button";
import { compressImage, validateImageFile } from "../utils/imageCompressor";
import { vibrateError, vibrateSuccess } from "../utils/haptic";
import "../styles/FaceUpload.css";

type FaceUploadProps = {
  onUpload: (file: File) => void;
  onBack: () => void;
};

export default function FaceUpload({ onUpload, onBack }: FaceUploadProps) {
  const DAILY_FREE_LIMIT = 10;
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [remainingCount, setRemainingCount] = useState(DAILY_FREE_LIMIT);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodayUsageCount = () => {
    const todayKey = getTodayKey();
    const usageRaw = localStorage.getItem("free_analysis_usage");
    if (!usageRaw) return 0;

    try {
      const parsed = JSON.parse(usageRaw);
      if (parsed?.date !== todayKey) return 0;
      return Math.max(0, Number(parsed.count) || 0);
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const usedCount = getTodayUsageCount();
    setRemainingCount(Math.max(0, DAILY_FREE_LIMIT - usedCount));
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    try {
      setIsCompressing(true);
      setError(null);

      // 검증
      validateImageFile(selected);

      // 압축
      const compressed = await compressImage(selected);
      setFile(compressed);
      vibrateSuccess();
    } catch (err: any) {
      setError(err.message || '파일 처리 중 오류가 발생했습니다.');
      vibrateError();
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      setError('📸 사진을 먼저 업로드해주세요!');
      setTimeout(() => setError(null), 3000); // 3초 후 자동 사라짐
      return;
    }

    const todayKey = getTodayKey();
    const usageRaw = localStorage.getItem("free_analysis_usage");
    let usage = { date: todayKey, count: 0 };

    if (usageRaw) {
      try {
        const parsed = JSON.parse(usageRaw);
        if (parsed?.date === todayKey) {
          usage = {
            date: todayKey,
            count: Number(parsed.count) || 0,
          };
        }
      } catch {
        usage = { date: todayKey, count: 0 };
      }
    }

    if (usage.count >= DAILY_FREE_LIMIT) {
      setError("⏰ 무료 분석은 1일 10회까지 가능합니다.");
      setRemainingCount(0);
      setTimeout(() => setError(null), 5000);
      return;
    }

    localStorage.setItem(
      "free_analysis_usage",
      JSON.stringify({
        date: todayKey,
        count: usage.count + 1,
      })
    );

    setRemainingCount(Math.max(0, DAILY_FREE_LIMIT - (usage.count + 1)));
    
    onUpload(file);
  };

  return (
    <div className="page">
      <button className="top-back-btn" onClick={onBack}>
        ← 뒤로가기
      </button>

      <div className="page-header">
        <h1 className="page-title">사진 업로드</h1>
        <p className="page-subtitle">얼굴이 잘 보이는 정면 사진을 올려주세요</p>
        <p className="limit-info">오늘 남은 무료 분석 {remainingCount}회</p>
      </div>

      <div className="upload-actions">
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isCompressing}>
          {isCompressing ? '처리 중...' : '파일 업로드'}
        </Button>
        <Button variant="secondary" onClick={() => cameraInputRef.current?.click()} disabled={isCompressing}>
          {isCompressing ? '처리 중...' : '카메라로 촬영'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden-input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden-input"
      />

      {previewUrl && (
        <div className="photo-preview">
          <img src={previewUrl} alt="미리보기" />
        </div>
      )}

      {error && (
        <div className="error-toast">
          {error}
        </div>
      )}

      <Button onClick={handleAnalyze}>
        AI 분석 시작
      </Button>
    </div>
  );
}
