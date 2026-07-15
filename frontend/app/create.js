import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import CreateNodePage from '../src/ui/pages/nodes/CreateNodePage';

export default function Create() {
  return (
    <ErrorBoundary>
      <CreateNodePage />
    </ErrorBoundary>
  );
}