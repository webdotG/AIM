import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';
import { usePlatform } from '@/layers/platform';

const SettingsPage = () => {
  const { t } = useLanguage();
  const { currentTheme, setTheme, themes } = useTheme();
  const { platform } = usePlatform();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Настройки</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Профиль</Text>
        <Text style={styles.profileText}>Логин: {user.login || '—'}</Text>
        <Text style={styles.profileText}>Платформа: {platform}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Интерфейс</Text>
        <Text style={styles.themeLabel}>Текущая тема: {currentTheme}</Text>
        {themes.map((theme, i) => (
          <View key={i} style={styles.themeOption}>
            <Text style={[styles.themeText, currentTheme === theme.name && styles.themeTextActive]}>
              {theme.label || theme.name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Данные</Text>
        <Text style={styles.dataText}>Статистика через /api/v1/analytics/stats</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  profileText: { fontSize: 14, color: '#888', marginBottom: 4 },
  themeLabel: { fontSize: 14, color: '#888', marginBottom: 8 },
  themeOption: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 4 },
  themeText: { fontSize: 14 },
  themeTextActive: { color: '#0066ff', fontWeight: 'bold' },
  dataText: { fontSize: 14, color: '#888' },
});

export default SettingsPage;