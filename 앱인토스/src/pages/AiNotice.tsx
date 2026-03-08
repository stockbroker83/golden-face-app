import Button from "../components/Button";

type AiNoticeProps = {
  onAccept: () => void;
};

export default function AiNotice({ onAccept }: AiNoticeProps) {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">AI 관상 분석 안내</h1>
        <p className="page-subtitle">사진 기반 AI 분석 결과는 참고용입니다.</p>
      </div>

      <ul className="list">
        <li>분석 결과는 오락/참고 목적으로 제공됩니다.</li>
        <li>개인정보는 분석 후 저장하지 않습니다.</li>
        <li>프리미엄 결제 전 무료 미리보기를 제공합니다.</li>
      </ul>

      <Button onClick={onAccept}>동의하고 시작하기</Button>
    </div>
  );
}
