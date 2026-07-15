import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function Input({
  value,
  onChange,
  type = 'text',
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  required = false,
  icon,
  maxLength,
  style: customStyle,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperStyle = [
    styles.wrapper,
    error && styles.errorWrapper,
    isFocused && styles.focusedWrapper,
    disabled && styles.disabledWrapper,
  ];

  const inputStyle = [
    styles.input,
    error && styles.errorInput,
    isFocused && styles.focusedInput,
    disabled && styles.disabledInput,
    icon && styles.withIconInput,
  ];

  return (
    <View style={wrapperStyle}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <View style={styles.container}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}

        <TextInput
          style={inputStyle}
          value={value || ''}
          onChange={() => onChange(e.target.value)}
          placeholder={placeholder}
          editable={!disabled}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={type === 'number' ? 'numeric' : 'default'}
        />
      </View>

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
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
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
  },
  errorWrapper: {
    borderColor: 'red',
  },
  focusedWrapper: {
    borderColor: '#0066ff',
  },
  disabledWrapper: {
    opacity: 0.7,
  },
  errorInput: {
    borderColor: 'red',
  },
  focusedInput: {
    borderWidth: 3,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  withIconInput: {
    paddingLeft: 40,
  },
  icon: {
    position: 'absolute',
    left: 12,
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    zIndex: 1,
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