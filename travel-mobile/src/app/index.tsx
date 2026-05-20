import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth-context';

export default function HomeScreen() {
  const { token, user, signOut } = useAuth();

  function handleLogout() {
    signOut();
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добре дошли в Travel Group Organizer</Text>
      <Text style={styles.subtitle}>
        Планирайте и управлявайте групови пътувания с приятели, семейство и общности.
      </Text>

      {token ? (
        <View style={styles.actions}>
          <Text style={styles.userText}>Влезли сте като {user?.name || user?.email}.</Text>
          <Link href="/trips" style={styles.secondaryLink}>
            Моите пътувания
          </Link>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Изход</Text>
          </Pressable>
        </View>
      ) : (
        <Link href="/login" style={styles.loginLink}>
          Вход
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 32,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f7f2',
  },
  loginLink: {
    alignSelf: 'flex-start',
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0f766e',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    borderRadius: 8,
    backgroundColor: '#b42318',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLink: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 520,
    color: '#46515a',
    fontSize: 17,
    lineHeight: 24,
  },
  title: {
    color: '#19212a',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 38,
  },
  userText: {
    color: '#46515a',
    fontSize: 16,
  },
});
