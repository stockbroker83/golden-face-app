type AiBadgeProps = {
  label?: string;
};

export default function AiBadge({ label = "AI 생성" }: AiBadgeProps) {
  return <span className="ai-badge">🤖 {label}</span>;
}
