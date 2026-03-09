interface QuickQuestionsProps {
  onSelect: (question: string) => void;
  disabled: boolean;
}

const questions = [
  "오늘 운세가 궁금해요",
  "연애 조언 부탁해요",
  "중요한 결정을 앞두고 있어요",
];

const QuickQuestions = ({ onSelect, disabled }: QuickQuestionsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-border
                     bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary/40
                     disabled:opacity-40 transition-all whitespace-nowrap"
        >
          {q}
        </button>
      ))}
    </div>
  );
};

export default QuickQuestions;
