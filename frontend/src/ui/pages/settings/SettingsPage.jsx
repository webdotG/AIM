

import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';

import Header from '@/ui/components/layout/Header';

import './SettingsPage.css';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();


  
  return (
    <div className="settings-page" data-theme={currentTheme.name}>
      <Header/>
      
    </div>
  );
}