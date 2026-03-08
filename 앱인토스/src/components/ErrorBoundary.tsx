import { Component, ErrorInfo, ReactNode } from 'react';
import '../styles/ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary 캐치:', error, errorInfo);
    
    // 에러 로깅 서비스 전송 (선택)
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">문제가 발생했습니다</h1>
            <p className="error-message">
              앱 실행 중 오류가 발생했습니다.<br />
              잠시 후 다시 시도해 주세요.
            </p>
            
            {this.state.error && (
              <details className="error-details">
                <summary>오류 상세 정보</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            
            <button className="error-reload-btn" onClick={this.handleReload}>
              새로고침
            </button>
            
            <p className="error-support">
              계속 문제가 발생하면{' '}
              <a href="mailto:support@goldface.com">support@goldface.com</a>으로 문의해 주세요.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
