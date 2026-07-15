import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function TabBar({ tabs, defaultTab = 0, onChange, ...props }) {
  const [isActive, setActive] = useState(defaultTab);
  const handleTabClick = (index) => {
    setActive(index);
    if (onChange) onChange(tabs[index].key || tabs[index].label, index);
  };

  return (
    <View style={[styles.tabBar, props.style]}>
      {tabs.map((tab, index) => (
        <Pressable
          key={tab.key || tab.label}
          style={[styles.tab, isActive === index && styles.tabActive]}
          onPress={() => handleTabClick(index)}
        >
          {tab.icon && <Text style={styles.tabIcon}>{tab.icon}</Text>}
          <Text style={[styles.tabLabel, isActive === index && styles.tabLabelActive]}>
            {tab.label}
          </Text>
          {tab.count !== undefined && tab.count !== null && (
            <Text style={[styles.tabCount, isActive === index && styles.tabCountActive]}>
              {tab.count}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxHeight: 50,
    padding: 0,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 4,
    marginBottom: 4,
  },
  tabActive: {
    backgroundColor: '#0066ff',
    borderColor: '#0066ff',
  },
  tabIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    flexShrink: 1,
  },
  tabLabelActive: {
    color: '#fff',
  },
  tabCount: {
    marginLeft: 6,
    minWidth: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 11,
    color: '#888',
  },
  tabCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#fff',
  },
});