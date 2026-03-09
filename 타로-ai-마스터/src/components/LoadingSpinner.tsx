const LoadingSpinner = ({ text = "로딩 중..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-8">
    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export default LoadingSpinner;
