import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import NodeListPage from '../src/ui/pages/nodes/NodeListPage';

export default function Index() {
  return (
    <ErrorBoundary>
      <NodeListPage />
    </ErrorBoundary>
  );
}