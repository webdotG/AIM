import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import GraphViewPage from '../src/ui/pages/graph/GraphViewPage';

export default function Graph() {
  return (
    <ErrorBoundary>
      <GraphViewPage />
    </ErrorBoundary>
  );
}