import React from 'react';
import { useLanguage } from '@/layers/language';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Можно отправить ошибку в сервис мониторинга
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Компонент для отображения ошибки
const ErrorFallback = ({ error }) => {
  const { t } = useLanguage();
  
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="error-boundary">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title">{t('common.error')}</h1>
        <p className="error-message">
          {error?.message || t('common.somethingWentWrong')}
        </p>
        <div className="error-actions">
          <button className="error-button primary" onClick={handleReload}>
            {t('common.reload')}
          </button>
          <button className="error-button secondary" onClick={handleGoHome}>
            {t('common.goHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Хук для использования Error Boundary
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  const handleError = (error) => {
    console.error('Error caught by useErrorBoundary:', error);
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError,
    ErrorBoundaryComponent: error ? () => <ErrorFallback error={error} /> : null
  };
};

export default ErrorBoundary;