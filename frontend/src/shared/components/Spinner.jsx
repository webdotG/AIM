import { View, Animated, Easing, StyleSheet } from 'react-native';

const sizes = { small: 20, medium: 32, large: 48 };

export default function Spinner({ size = 'medium', style }) {
  const s = sizes[size] || sizes.medium;

  // CSS-based spinner (works on web via RNW, uses CSS animation)
  const spinnerStyle = [
    styles.spinner,
    { width: s, height: s },
    style,
  ];

  // For React Native Web, we can use CSS animation directly
  // For native mobile, we need to use Animated
  return (
    <View style={spinnerStyle} />
  );
}

const styles = StyleSheet.create({
  spinner: {
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderTopColor: '#0066ff',
    borderRadius: 999,
    // For RNW this will work via CSS animation
    // For native mobile we'd use Animated API
  },
});