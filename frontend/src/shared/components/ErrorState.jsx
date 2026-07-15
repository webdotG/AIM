import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigator } from '@/shared/platform/useNavigator';

export default function ErrorState({ title = 'Ошибка', description, onRetry }) {
  const { navigate } = useNavigator();
  
  const handleGoHome = () => navigate('/');

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.text}>{description}</Text>}
      {onRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      )}
      <Pressable style={[styles.button, styles.buttonSecondary]} onPress={handleGoHome}>
        <Text style={styles.buttonTextSecondary}>← На главную</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  text: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonSecondary: { backgroundColor: '#e0e0e0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  buttonTextSecondary: { color: '#000', fontSize: 16, fontWeight: '500' },
});