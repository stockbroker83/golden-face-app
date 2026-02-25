import { useNavigate } from "react-router-dom";

interface TarotMenuCardProps {
  title: string;
  icon: string;
  description: string;
  path: string;
  delay: number;
}

const TarotMenuCard = ({ title, icon, description, path, delay }: TarotMenuCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="w-full bg-gradient-card border border-border rounded-lg p-5 text-left 
                 shadow-card hover:shadow-gold transition-all duration-300
                 hover:border-gold/40 hover:scale-[1.02] active:scale-[0.98]
                 opacity-0 animate-fade-in-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl group-hover:animate-float">{icon}</span>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-gradient-gold">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <span className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">
          ✦
        </span>
      </div>
    </button>
  );
};

export default TarotMenuCard;
