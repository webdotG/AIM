import { View, Text, Pressable, StyleSheet } from 'react-native';
import Spinner from '@/shared/components/Spinner';

const VARIANTSTYLES = {
  primary: {
    backgroundColor: '#0066ff',
    borderColor: '#0066ff',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#6c7afe',
    borderColor: '#6c7afe',
    color: '#fff',
  },
  success: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    color: '#fff',
  },
  danger: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
    color: '#fff',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: '#e0e0e0',
    color: '#000',
  },
};

const SIZES = {
  small: { padding: 8, fontSize: 12, minHeight: 32 },
  medium: { padding: 12, fontSize: 14, minHeight: 40 },
  large: { padding: 16, fontSize: 16, minHeight: 48 },
};

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  ...props
}) {
  const variantStyle = VARIANTSTYLES[variant] || VARIANTSTYLES.primary;
  const sizeStyle = SIZES[size] || SIZES.medium;
  const isDisabled = !disabled && !loading && onPress;

  const combinedStyle = [
    styles.button,
    variantStyle,
    sizeStyle,
    disabled && styles.disabled,
    loading && styles.loading,
    style,
  ];

  return (
    <Pressable
      style={combinedStyle}
      onPress={isDisabled ? onPress : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="small" />
      ) : icon ? (
        <Text style={[styles.icon, {color: variantStyle.color}]}>{icon}</Text>
      ) : null}
      {children ? <Text style={[styles.text, {color: variantStyle.color}]}>{children}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    minWidth: 40,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  loading: {
    opacity: 0.6,
  },
});