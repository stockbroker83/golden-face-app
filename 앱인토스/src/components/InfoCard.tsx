type InfoCardProps = {
  icon: string;
  title: string;
  content: string;
  unlocked?: boolean;
  blur?: boolean;
};

export default function InfoCard({ icon, title, content, unlocked = true, blur = false }: InfoCardProps) {
  return (
    <div className={`info-card ${!unlocked ? "locked" : ""}`}>
      <div className="info-card-title">
        <span>{icon}</span>
        <strong>{title}</strong>
      </div>
      <p className={blur ? "blur-text" : ""}>{content}</p>
    </div>
  );
}
