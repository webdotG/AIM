// src/ui/pages/analytics/AnalyticsPage.jsx
import React from 'react';
import { useLanguage } from '@/layers/language';
import Header from '@/ui/components/layout/Header';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="analytics-page">
      {/* <Header  */}
        title={t('analytics.title')}
        showBack={true}
      />
      
      <main className="analytics-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{t('analytics.total_entries')}</h3>
            <div className="stat-value">0</div>
          </div>
          
          <div className="stat-card">
            <h3>{t('analytics.by_type')}</h3>
            <div className="stat-value">
              <div>Сны: 0</div>
              <div>Мысли: 0</div>
              <div>Воспоминания: 0</div>
              <div>Планы: 0</div>
            </div>
          </div>
          
          <div className="stat-card">
            <h3>{t('analytics.emotions')}</h3>
            <div className="stat-value">В разработке</div>
          </div>
          
          <div className="stat-card">
            <h3>{t('analytics.connections')}</h3>
            <div className="stat-value">0</div>
          </div>
        </div>
        
        <div className="coming-soon">
          <p>{t('analytics.coming_soon')}</p>
        </div>
      </main>
    </div>
  );
}