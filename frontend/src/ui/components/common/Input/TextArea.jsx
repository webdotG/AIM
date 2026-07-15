import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Textarea from '@/ui/components/common/Input/TextArea';

export default function Input({
  value,
  onChange,
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  required = false,
  maxLength,
  rows = 4,
  style: customStyle,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = [
    styles.textarea,
    error && styles.errorTextarea,
    isFocused && styles.focusedTextarea,
    disabled && styles.disabledInputTextarea,
    { minHeight: (rows + 2) * 24 },
    customStyle,
  ];

  const wrapperStyle = [
    styles.wrapper,
    isFocused && styles.focusedWrapper,
    disabled && styles.disabledWrapper,
  ];

  return (
    <View style={wrapperStyle}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <TextInput
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        editable={!disabled}
        maxLength={maxLength}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocused(false)}
        multLine={true}
        numberOfLines={rows}
        {...props}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {maxLength && !error ? (
        <Text style={styles.counter}>
          {(value?.length || 0)} / {maxLength}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  required: {
    color: 'red',
    fontWeight: 'bold',
  },
  textarea: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    color: '#000',
    outlineStyle: 'none',
    letterSpacing: 1,
    outline: 'vertical',
  },
  errorTextarea: {
    borderColor: 'red',
  },
  focusedTextarea: {
    borderWidth: 3,
  },
  disabledTextarea: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  focusedWrapper: {
    borderColor: '#0066ff',
  },
  disabledWrapper: {
    opacity: 0.7,
  },
  error: {
    marginTop: 4,
    fontSize: 11,
    color: 'red',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counter: {
    marginTop: 4,
    fontSize: 11,
    color: '#888',
    textAlign: 'right',
    fontWeight: 'bold',
  },
});