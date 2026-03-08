import '../styles/Skeleton.css';

export function FeatureSkeleton() {
  return (
    <div className="feature-skeleton">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-score"></div>
      <div className="skeleton skeleton-bar"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
    </div>
  );
}

export function AnalyzingWithSkeleton() {
  return (
    <div className="analyzing-container">
      <div className="spinner">⏳</div>
      <h2>AI가 당신의 관상을 분석 중입니다...</h2>
      
      <div className="skeleton-list">
        {[1, 2, 3, 4, 5].map((i) => (
          <FeatureSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
