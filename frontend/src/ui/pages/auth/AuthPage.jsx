import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/StoreContext';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import Input from '@/ui/components/common/Input/Input';
import Button from '@/ui/components/common/Button/Button';
import Loader from '@/ui/components/common/Loader/Loader';
import PasswordInput from '@/ui/components/auth/PasswordInput/PasswordInput';
import HCaptcha from '@/ui/components/auth/HCaptcha/HCaptcha';
import BackupCodeModal from '@/ui/components/auth/BackupCodeModal/BackupCodeModal';
import { useNavigator } from '@/shared/platform/useNavigator';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showBackup, setShowBackup] = useState(false);
  const [genBackupCode, setGenBackupCode] = useState('');

  const { theme } = useTheme();
  const { t } = useLanguage();
  const authStore = useAuthStore();
  const { navigate } = useNavigator();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (!hcaptchaToken) { setError('hCaptcha required'); setLoading(false); return; }
    try {
      if (mode === 'register') {
        if (password !== confirmPass) { setError('Passwords do not match'); setLoading(false); return; }

        if (passwordStrength && !passwordStrength.isStrong) { setError('Password not strong'); setLoading(false); return; }
        const result = await authStore.register({ login, password, hcaptchaToken });
        if (result.backupCode) { setGenBackupCode(result.backupCode); setShowBackup(true); }
        else navigate('/');
      } else if (mode === 'login') {
        await authStore.login({ login, password, hcaptchaToken });
        navigate('/');
      } else if (mode === 'recover') {
        const result = await authStore.recover({ backupCode, newPassword: password, hcaptchaToken });
        if (result.backupCode) { setGenBackupCode(result.backupCode); setShowBackup(true); }
        else navigate('/auth');
      }
    } catch (err) { setError(err.message || 'Error'); }
    finally { setLoading(false); }
  };

  if (loading) return <Loader />;

  if (showBackup) {
    return (
      <BackupCodeModal
        isOpen={true}
        onClose={() => { setShowBackup(false); setGenBackupCode(''); setMode('login'); setPassword(''); setConfirmPass(''); setLogin(''); }}
        backupCode={genBackupCode}
        title="Backup code"
        warning="Save this code"
      />
    );
  }

  const title = mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Recover';
  const subtitle = mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>
      <Input label="Login" value={login} onChange={setLogin} required />
      <Input label="Password" type="password" value={password} onChange={setPassword} required />
      <HCaptcha onVerify={(token) => setHcaptchaToken(token)} onError={() => setError('Captcha error')} onExpire={() => setHcaptchaToken('')} theme={theme} />
      <Button variant="primary" fullWidth disabled={!hcaptchaToken} onPress={handleSubmit}>{title}</Button>
      <View style={s.footer}>
        {mode === 'login' && <Pressable onPress={() => setMode('recover')}><Text style={s.link}>Recover password</Text></Pressable>}
        {mode === 'recover' && <Pressable onPress={() => { setMode('login'); setPassword(''); setBackupCode(''); }}><Text style={s.link}>Back to login</Text></Pressable>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  form: { marginBottom: 16 },
  error: { backgroundColor: '#feebeb', borderRadius: 6, padding: 12, marginBottom: 12 },
  errorText: { color: 'red', fontSize: 13 },
  footer: { flexDirection: 'row', marginTop: 16 },
  link: { color: '#0066ff', fontSize: 14, marginVertical: 8 },
});