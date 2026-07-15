import React from 'react';
import ErrorBoundary from '../../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import NodeDetailPage from '../../src/ui/pages/nodes/NodeDetailPage';

export default function NodeDetail({ params }) {
  return (
    <ErrorBoundary>
      <NodeDetailPage params={params} />
    </ErrorBoundary>
  );
}