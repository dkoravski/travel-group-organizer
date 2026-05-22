import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/lib/auth-context';

const highlights = [
  { icon: 'people-outline', label: 'Групи', text: 'Организация на приятели и семейство.' },
  { icon: 'calendar-outline', label: 'План', text: 'Дати, места, участници и коментари.' },
  { icon: 'options-outline', label: 'Предпочитания', text: 'Транспорт, настаняване и бележки.' },
] as const;

export default function HomeScreen() {
  const { token, user } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>Travel Group Organizer</Text>
          <Text style={styles.title}>Планирайте групови пътувания без хаос.</Text>
        </View>

        <View style={styles.contentBlock}>
          <Text style={styles.subtitle}>
            Управлявайте маршрути, участници, гости, коментари и лични предпочитания.
          </Text>

          {token ? (
            <View style={styles.actions}>
              <Text style={styles.userText}>Влезли сте като {user?.name || user?.email}.</Text>
              <Pressable style={styles.primaryButton} onPress={() => router.push('/trips')}>
                <Text style={styles.primaryButtonText}>Моите пътувания</Text>
                <Ionicons name="arrow-forward" size={17} color="#ffffff" />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.highlights}>
            {highlights.map((item) => (
              <View key={item.label} style={styles.highlightCard}>
                <View style={styles.highlightIcon}>
                  <Ionicons name={item.icon} size={19} color="#0f766e" />
                </View>
                <View style={styles.highlightCopy}>
                  <Text style={styles.highlightTitle}>{item.label}</Text>
                  <Text style={styles.highlightText}>{item.text}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  container: {
    flex: 1,
    paddingBottom: 94,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  contentBlock: {
    marginTop: 34,
    maxWidth: 620,
  },
  highlightCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e0e5e8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  highlightCopy: {
    flex: 1,
  },
  highlightIcon: {
    alignItems: 'center',
    backgroundColor: '#dff3ef',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  highlightText: {
    color: '#5c6873',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  highlightTitle: {
    color: '#19212a',
    fontSize: 15,
    fontWeight: '900',
  },
  highlights: {
    gap: 8,
    marginTop: 16,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  screen: {
    backgroundColor: '#f6f7f3',
    flex: 1,
  },
  subtitle: {
    color: '#46515a',
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 560,
  },
  title: {
    color: '#19212a',
    fontSize: 29,
    fontWeight: '900',
    lineHeight: 35,
    marginTop: 6,
  },
  titleBlock: {
    maxWidth: 620,
  },
  userText: {
    color: '#46515a',
    fontSize: 13,
    width: '100%',
  },
});
