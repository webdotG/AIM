import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigator } from '@/shared/platform/useNavigator';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error }) {
  const { navigate } = useNavigator();
  
  const handleGoHome = () => {
    navigate('/');
  };

  const handleReload = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.icon}>⚠️</Text>
      <Text style={s.title}>Что-то пошло не так</Text>
      <Text style={s.message}>
        {error?.message || 'Произошла ошибка'}
      </Text>
      <Pressable style={s.button} onPress={handleGoHome}>
        <Text style={s.buttonText}>← На главную</Text>
      </Pressable>
      <Pressable style={[s.button, s.buttonSecondary]} onPress={handleReload}>
        <Text style={s.buttonTextSecondary}>Перезагрузить</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  buttonTextSecondary: { color: '#000', fontSize: 16, fontWeight: '500' },
});

export default ErrorBoundary;