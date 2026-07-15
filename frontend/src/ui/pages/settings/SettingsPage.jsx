import { Text, View, StyleSheet } from 'react-native';
import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';
import { usePlatform } from '@/layers/platform';

const SettingsPage = () => {
  const { t } = useLanguage();
  const { currentTheme, setTheme, themes } = useTheme();
  const { platform } = usePlatform();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <View style={s.container}>
      <Text style={s.heading}>Настройки</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Профиль</Text>
        <Text style={s.text}>Логин: {user?.login || '—'}</Text>
        <Text style={s.text}>Платформа: {platform}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Интерфейс</Text>
        <Text style={s.text}>Текущая тема: {currentTheme}</Text>
        {(themes || []).map((theme, i) => (
          <View key={i} style={s.option}>
            <Text style={[s.optionText, currentTheme === theme.name && s.optionTextActive]}>
              {theme.label || theme.name}
            </Text>
          </View>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Данные</Text>
        <Text style={s.text}>Статистика: /api/v1/analytics/stats</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 14, color: '#888', marginBottom: 4 },
  option: { padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 4 },
  optionText: { fontSize: 14 },
  optionTextActive: { color: '#0066ff', fontWeight: 'bold' },
});

export default SettingsPage;
;