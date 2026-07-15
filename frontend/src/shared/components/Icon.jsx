import { Text, View, StyleSheet } from 'react-native';

const ICONS = {
  home: '🏠',
  back: '←',
  forward: '→',
  up: '↑',
  down: '↓',
  edit: '✏️',
  trash: '🗑️',
  heart: '❤️',
  settings: '⚙️',
  chart: '📊',
  user: '👤',
  tag: '🏷️',
  layers: '📚',
  image: '🖼️',
  x: '✕',
  check: '✓',
  search: '🔍',
  arrowLeft: '←',
  arrowRight: '→',
  arrowUp: '↑',
  arrowDown: '↓',
  fork: '🍴',
};

export default function Icon({ name, size = 24, color, style, ...props }) {
  const icon = ICONS[name] || '❓';
  const iconStyle = [
    styles.icon,
    { fontSize: size, color: color || '#000' },
    style,
  ];

  return (
    <Text style={iconStyle} {...props}>
      {icon}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});