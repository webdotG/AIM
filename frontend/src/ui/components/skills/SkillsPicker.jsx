import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import Button from '../common/Button/Button';
import './SkillsPicker.css';


const SkillsPicker = observer(({
  selectedSkills = [],
  onChange,
  maxSkills = 10,
  mode = 'default'
}) => {
  const { t } = useLanguage();
  const { isTelegram } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  
  // ... остальной код SkillsPicker без объявления PlatformButton
  
  return (
    <div className="skills-picker">
      {/* Используй PlatformButton из импорта */}
      <Button onClick={handleAddSkill}>
        Добавить навык
      </Button>
    </div>
  );
});

export default SkillsPicker;
