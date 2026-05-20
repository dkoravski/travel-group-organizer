import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { login } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Въведете имейл и парола.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await login(email, password);
      signIn(result.token, result.user);
      router.replace('/trips');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Неуспешен вход.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Вход в профила</Text>
        <Text style={styles.subtitle}>Влезте, за да управлявате вашите групови пътувания.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Имейл</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="name@example.com"
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Парола</Text>
          <TextInput
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="Вашата парола"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Вход</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0f766e',
    marginTop: 8,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f7f7f2',
    padding: 24,
    paddingTop: 56,
  },
  field: {
    gap: 8,
    marginTop: 18,
  },
  error: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  form: {
    width: '100%',
    maxWidth: 420,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4d8dd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#19212a',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: '#27313b',
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: '#46515a',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  title: {
    color: '#19212a',
    fontSize: 28,
    fontWeight: '800',
  },
});
