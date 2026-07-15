import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import PeoplePage from '../src/ui/pages/people/PeoplePage';

export default function People() {
  return (
    <ErrorBoundary>
      <PeoplePage />
    </ErrorBoundary>
  );
}