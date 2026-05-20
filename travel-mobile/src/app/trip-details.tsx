import { StyleSheet, Text, View } from 'react-native';

import { useRequireAuth } from '@/lib/use-require-auth';

export default function TripDetailsScreen() {
  const { isNavigationReady, isRestoring, token } = useRequireAuth();

  if (!isNavigationReady || isRestoring || !token) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.status}>Планира се</Text>
        <Text style={styles.title}>Уикенд в Пловдив</Text>
        <Text style={styles.subtitle}>24 - 26 май 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Участници</Text>
          <Text style={styles.body}>6 души са включени в това пътуване.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Следваща стъпка</Text>
          <Text style={styles.body}>Изберете място за настаняване и потвърдете транспорта.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: '#46515a',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f2',
    padding: 24,
  },
  content: {
    maxWidth: 620,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#dfe4e8',
    marginTop: 24,
    paddingTop: 18,
  },
  sectionTitle: {
    color: '#19212a',
    fontSize: 18,
    fontWeight: '800',
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#e0f2f1',
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  subtitle: {
    color: '#46515a',
    fontSize: 17,
    marginTop: 8,
  },
  title: {
    color: '#19212a',
    fontSize: 30,
    fontWeight: '800',
  },
});
