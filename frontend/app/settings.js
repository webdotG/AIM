import React from 'react';
import ErrorBoundary from '../src/ui/components/common/ErrorBoundary/ErrorBoundary';
import SettingsPage from '../src/ui/pages/settings/SettingsPage';

export default function Settings() {
  return (
    <ErrorBoundary>
      <SettingsPage />
    </ErrorBoundary>
  );
}