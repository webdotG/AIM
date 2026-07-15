import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

export default function Card({
  children,
  onPress,
  style,
  variant = 'default',
  noPadding = false,
  ...props
}) {
  const variants = {
    default: {},
    clickable: {cursor: 'pointer'},
  };
  const variantStyle = variants[variant] || {};
  const paddingStyle = noPadding ? {padding: 0} : {};

  const combinedStyle = [
    styles.card,
    variantStyle,
    paddingStyle,
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={combinedStyle} {...props}>
        {children}
      </Pressable>
    );
  }

  return <View style={combinedStyle} {...props}>{children}</View>;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 16,
    marginVertical: 4,
  },
});