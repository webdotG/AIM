import React, { useState, useMemo } from 'react';

function Filters({ filters, onChange }) {
  const types = [
    { value: 'all', label: 'Все', icon: '📋' },
    { value: 'dream', label: 'Сны', icon: '💭' },
    { value: 'memory', label: 'Воспоминания', icon: '📜' },
    { value: 'thought', label: 'Мысли', icon: '💡' },
    { value: 'plan', label: 'Планы', icon: '🎯' }
  ];

  return (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Поиск по записям..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
      </div>

      {/* Type Filter */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#757575'
        }}>
          ТИП ЗАПИСИ
        </label>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {types.map(type => (
            <button
              key={type.value}
              onClick={() => onChange({ ...filters, type: type.value })}
              style={{
                padding: '8px 16px',
                background: filters.type === type.value ? '#007bff' : '#f5f5f5',
                color: filters.type === type.value ? 'white' : '#212121',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: filters.type === type.value ? '600' : '400',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                if (filters.type !== type.value) {
                  e.target.style.background = '#e0e0e0';
                }
              }}
              onMouseLeave={(e) => {
                if (filters.type !== type.value) {
                  e.target.style.background = '#f5f5f5';
                }
              }}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#757575'
        }}>
          СОРТИРОВКА
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          style={{
            padding: '10px 12px',
            fontSize: '14px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            outline: 'none',
            width: '100%'
          }}
        >
          <option value="date-desc">Сначала новые</option>
          <option value="date-asc">Сначала старые</option>
          <option value="type">По типу</option>
        </select>
      </div>

      {/* Active Filters Count */}
      {(filters.search || filters.type !== 'all') && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#e3f2fd',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#1976d2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            Активных фильтров: {(filters.search ? 1 : 0) + (filters.type !== 'all' ? 1 : 0)}
          </span>
          <button
            onClick={() => onChange({ search: '', type: 'all', sortBy: 'date-desc' })}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1976d2',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
}

export default Filters