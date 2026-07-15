import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import AnalyticsPage from '../src/ui/pages/analytics/AnalyticsPage';

export default function Analytics() {
  return (
    <ErrorBoundary>
      <AnalyticsPage />
    </ErrorBoundary>
  );
}