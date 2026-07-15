import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/StoreContext';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import Button from '@/ui/components/common/Button/Button.jsx';
import Loader from '@/ui/components/common/Loader/Loader.jsx';
import HCaptcha from '@/ui/components/auth/HCaptcha/HCaptcha.jsx';
import { useNavigator } from '@/shared/platform/useNavigator';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { theme } = useTheme();
  const { t } = useLanguage();
  const authStore = useAuthStore();
  const { navigate } = useNavigator();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    if (!hcaptchaToken) {
      setError('hCaptcha required');
      setLoading(false);
      return;
    }
    
    try {
      if (mode === 'login') {
        await authStore.login({ login, password, hcaptchaToken });
        navigate('/');
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await authStore.register({ login, password, hcaptchaToken });
        navigate('/');
      } else if (mode === 'recover') {
        await authStore.recover({ backupCode: login, newPassword: password, hcaptchaToken });
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err?.message || (mode === 'login' ? 'Login failed' : 'Operation failed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const title = mode === 'login' ? 'Войти' : mode === 'register' ? 'Регистрация' : 'Восстановление';
  const subtitle = mode === 'login' 
    ? 'Введите свои данные' 
    : mode === 'register' 
    ? 'Создайте аккаунт' 
    : 'Введите код восстановления';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>

      {error && <Text style={s.error}>{error}</Text>}

      <View style={s.form}>
        <TextInput
          style={s.input}
          placeholder="Логин"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
        />

        <TextInput
          style={s.input}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {mode === 'register' && (
          <TextInput
            style={s.input}
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        )}

        <HCaptcha
          onVerify={setHcaptchaToken}
          onError={() => setError('Captcha error')}
          onExpire={() => setHcaptchaToken('')}
          theme={theme}
        />

        <Button variant="primary" fullWidth disabled={!hcaptchaToken} onPress={handleSubmit}>
          {title}
        </Button>
      </View>

      <View style={s.footer}>
        {mode === 'login' && (
          <>
            <Pressable onPress={() => { setMode('register'); setError(''); }}>
              <Text style={s.link}>Регистрация</Text>
            </Pressable>
            <Pressable onPress={() => { setMode('recover'); setError(''); }}>
              <Text style={s.link}>Восстановить</Text>
            </Pressable>
          </>
        )}

        {(mode === 'register' || mode === 'recover') && (
          <Pressable onPress={() => {
            setMode('login');
            setError('');
            setLogin('');
            setPassword('');
            setConfirmPassword('');
            setHcaptchaToken('');
          }}>
            <Text style={s.link}>← Назад к входу</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  form: { marginBottom: 16 },
  error: { backgroundColor: '#feebeb', borderRadius: 6, padding: 12, marginBottom: 12 },
  errorText: { color: 'red', fontSize: 13 },
  input: { padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 12, fontSize: 14 },
  footer: { flexDirection: 'row', marginTop: 16 },
  link: { color: '#0066ff', fontSize: 14, marginVertical: 8 },
});