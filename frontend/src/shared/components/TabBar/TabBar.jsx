import { useState } from 'react';
import clsx from 'clsx';

export default function TabBar({ tabs, defaultTab = 0, onChange, className = '' }) {
  const [active, setActive] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActive(index);
    if (onChange) onChange(tabs[index].key || tabs[index].label, index);
  };

  return (
    <div className={clsx('tab-bar', className)}>
      {tabs.map((tab, index) => (
        <button
          key={tab.key || tab.label}
          className={clsx('tab-bar__tab', { 'tab-bar__tab--active': index === active })}
          onClick={() => handleTabClick(index)}
        >
          {tab.icon && <span className="tab-bar__tab-icon">{tab.icon}</span>}
          <span className="tab-bar__tab-label">{tab.label}</span>
          {tab.count !== undefined && tab.count !== null && (
            <span className="tab-bar__tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}