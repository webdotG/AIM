import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import AuthPage from '../src/ui/pages/auth/AuthPage';

export default function Auth() {
  return (
    <ErrorBoundary>
      <AuthPage />
    </ErrorBoundary>
  );
}