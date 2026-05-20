import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добре дошли в Travel Group Organizer</Text>
      <Text style={styles.subtitle}>
        Планирайте и управлявайте групови пътувания с приятели, семейство и общности.
      </Text>
      <Link href="/login" style={styles.loginLink}>
        Вход
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
