import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { getTrips, type TripSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export default function TripsScreen() {
  const { token, user, signOut } = useAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!token) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const page = await getTrips(token);
      setTrips(page.data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Пътуванията не могат да бъдат заредени.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  function handleLogout() {
    signOut();
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Моите пътувания</Text>
        <Text style={styles.subtitle}>
          {user?.name
            ? `${user.name}, това са пътуванията от вашите групи.`
            : 'Това са пътуванията от вашите групи.'}
        </Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Изход</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color="#0f766e" />
          <Text style={styles.stateText}>Зареждане на пътувания...</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadTrips}>
            <Text style={styles.retryText}>Опитай пак</Text>
          </Pressable>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Няма пътувания</Text>
          <Text style={styles.emptyText}>
            Когато има пътувания във вашите групи, те ще се покажат тук.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={trips}
          keyExtractor={(trip) => String(trip.id)}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push('/trip-details')}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.badge, item.canceled && styles.canceledBadge]}>
                  {item.canceled ? 'Отменено' : item.isJoined ? 'Участвате' : 'В групата'}
                </Text>
              </View>
              <Text style={styles.destination}>{item.destination}</Text>
              <Text style={styles.cardMeta}>{formatDateRange(item.startDate, item.endDate)}</Text>
              <Text style={styles.cardMeta}>{item.groupName}</Text>
              <Text style={styles.cardMeta}>{item.participantsCount} участници</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    backgroundColor: '#e0f2f1',
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  card: {
    borderWidth: 1,
    borderColor: '#dfe4e8',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 18,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardMeta: {
    color: '#5c6873',
    fontSize: 15,
    marginTop: 8,
  },
  cardTitle: {
    color: '#19212a',
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  canceledBadge: {
    backgroundColor: '#fee4e2',
    color: '#b42318',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f2',
    padding: 24,
  },
  destination: {
    color: '#27313b',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: '#dfe4e8',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 24,
    maxWidth: 620,
    padding: 20,
  },
  emptyText: {
    color: '#46515a',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  emptyTitle: {
    color: '#19212a',
    fontSize: 18,
    fontWeight: '800',
  },
  error: {
    color: '#b42318',
    fontSize: 15,
    lineHeight: 22,
  },
  header: {
    maxWidth: 620,
  },
  list: {
    gap: 14,
    maxWidth: 620,
    paddingBottom: 24,
    paddingTop: 24,
    width: '100%',
  },
  logoutButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  logoutText: {
    color: '#0f766e',
    fontSize: 15,
    fontWeight: '700',
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#0f766e',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  state: {
    alignItems: 'flex-start',
    marginTop: 24,
  },
  stateText: {
    color: '#46515a',
    fontSize: 15,
    marginTop: 10,
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
