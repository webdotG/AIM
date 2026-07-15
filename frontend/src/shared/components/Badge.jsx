import { View, Text, StyleSheet } from 'react-native';

const variants = {
  default: { backgroundColor: '#e0e0e0', color: '#000' },
  clickable: { backgroundColor: '#e0e0e0', color: '#000' },
  primary: { backgroundColor: '#0066ff', color: '#fff' },
  success: { backgroundColor: '#10b981', color: '#fff' },
  warning: { backgroundColor: '#f59e0b', color: '#fff' },
  danger: { backgroundColor: '#ef4444', color: '#fff' },
};

export default function Badge({ children, variant = 'default', style, ...props }) {
  const variantStyle = variants[variant] || {};

  return (
    <View style={[styles.badge, variantStyle, style]} {...props}>
      <Text style={[styles.text, {color: variantStyle.color || '#000'}]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 3,
    margin: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});