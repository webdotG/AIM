// src/ui/styles/themeUtils.js

/**
 * Получить CSS переменные из темы
 */
export const getThemeVariables = (themeData) => {
  if (!themeData || !themeData.colors) return {};
  
  return Object.entries(themeData.colors).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

/**
 * Применить тему к элементу
 */
export const applyThemeToElement = (element, themeData) => {
  if (!element || !themeData || !themeData.colors) return;
  
  Object.entries(themeData.colors).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
};

/**
 * Генератор CSS классов для тем
 */
export const createThemeClasses = (baseClass, themeName) => {
  return `${baseClass} theme-${themeName}`;
};

/**
 * Получить цвет по имени из текущей темы
 */
export const getThemeColor = (colorName, themeData, fallback = '#000000') => {
  return themeData?.colors?.[`--${colorName}`] || fallback;
};