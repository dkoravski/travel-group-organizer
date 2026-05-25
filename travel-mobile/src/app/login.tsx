import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { InteractivePressable } from '@/components/InteractivePressable';
import { login } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function navigateAfterSignIn() {
  setTimeout(() => {
    router.replace('/trips');
  }, 0);
}

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
      navigateAfterSignIn();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Неуспешен вход.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.iconBadge}>
            <Ionicons name="log-in" size={24} color="#0f766e" />
          </View>
          <Text style={styles.title}>Вход в профила</Text>
          <Text style={styles.subtitle}>
            Влезте, за да управлявате вашите групови пътувания и предпочитания.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Имейл</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting}
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
              editable={!isSubmitting}
              onChangeText={setPassword}
              placeholder="Вашата парола"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <InteractivePressable
            disabled={isSubmitting}
            feedback="primary"
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Вход</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </InteractivePressable>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f6f7f3',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 112,
  },
  error: {
    color: '#b42318',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  field: {
    gap: 8,
    marginTop: 18,
  },
  form: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e5e8',
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 460,
    padding: 24,
    width: '100%',
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#dff3ef',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: 18,
    width: 48,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d4d8dd',
    borderRadius: 8,
    borderWidth: 1,
    color: '#19212a',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: '#27313b',
    fontSize: 15,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#f6f7f3',
    flex: 1,
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
    fontWeight: '900',
  },
});
