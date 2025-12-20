// src/ui/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { usePlatform } from '@/layers/platform';
import Header from '@/ui/components/layout/Header';
import Navigation from './Navigation';
import './MainLayout.css';

export default function MainLayout() {
  const { isTelegram } = usePlatform();
  
  return (
    <div className="main-layout">
      {!isTelegram && <Header />}
      
      <main className="main-content">
        <Outlet />
      </main>
      
      {!isTelegram && <Navigation />}
    </div>
  );
}