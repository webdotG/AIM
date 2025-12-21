import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import './SkillsPicker.css';

// ТОЛЬКО ИМПОРТ, без объявления!
import { PlatformButton } from '@/ui/components/common/PlatformAdapter';

const SkillsPicker = observer(({
  selectedSkills = [],
  onChange,
  maxSkills = 10,
  mode = 'default' // 'default' или 'progress'
}) => {
  const { t } = useLanguage();
  const { isTelegram } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  
  // ... остальной код SkillsPicker без объявления PlatformButton
  
  return (
    <div className="skills-picker">
      {/* Используй PlatformButton из импорта */}
      <PlatformButton onClick={handleAddSkill}>
        Добавить навык
      </PlatformButton>
    </div>
  );
});

export default SkillsPicker;
