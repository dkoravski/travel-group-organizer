import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { getTrips, type TripSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-require-auth';

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export default function TripsScreen() {
  const { isNavigationReady, isRestoring, token, user } = useRequireAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const page = await getTrips(token);
      setTrips(page.data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Пътуванията не могат да бъдат заредени.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadTrips();
      }
    }, [loadTrips, token]),
  );

  if (!isNavigationReady || isRestoring || !token) {
    return (
      <View style={styles.container}>
        <View style={styles.state}>
          <ActivityIndicator color="#0f766e" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={isLoading || error ? [] : trips}
        keyExtractor={(trip) => String(trip.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.iconBadge}>
                <Ionicons name="airplane" size={22} color="#0f766e" />
              </View>
            </View>
            <Text style={styles.title}>Моите пътувания</Text>
            <Text style={styles.subtitle}>
              {user?.name
                ? `${user.name}, тук са пътуванията от вашите групи.`
                : 'Тук са пътуванията от вашите групи.'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator color="#0f766e" />
              <Text style={styles.stateText}>Зареждане на пътувания...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <Ionicons name="warning-outline" size={28} color="#b42318" />
              <Text style={styles.emptyTitle}>Не успяхме да заредим данните</Text>
              <Text style={styles.error}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={loadTrips}>
                <Text style={styles.retryText}>Опитай пак</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={28} color="#0f766e" />
              <Text style={styles.emptyTitle}>Няма пътувания</Text>
              <Text style={styles.emptyText}>
                Когато има пътувания във вашите групи, те ще се покажат тук.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/trip-details',
                params: { id: String(item.id) },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.destinationRow}>
                  <Ionicons name="location-outline" size={16} color="#667085" />
                  <Text style={styles.destination}>{item.destination}</Text>
                </View>
              </View>
              <Text style={[styles.badge, item.canceled && styles.canceledBadge]}>
                {item.canceled ? 'Отменено' : item.isJoined ? 'Участвате' : 'Виж пътуването'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-clear-outline" size={16} color="#667085" />
              <Text style={styles.cardMeta}>{formatDateRange(item.startDate, item.endDate)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="people-outline" size={16} color="#667085" />
              <Text style={styles.cardMeta}>{item.groupName}</Text>
            </View>

            <View style={styles.statsRow}>
              <Stat value={item.participantsCount} label="участници" />
              <Stat value={item.commentsCount} label="коментари" />
              <Stat value={item.preferencesCount} label="предпочитания" />
            </View>
          </Pressable>
        )}
      />
      <BottomNav />
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#dff3ef',
    borderRadius: 999,
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  canceledBadge: {
    backgroundColor: '#fee4e2',
    color: '#b42318',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#dfe4e8',
    borderRadius: 8,
    borderWidth: 1,
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
    flex: 1,
    fontSize: 15,
  },
  cardTitle: {
    color: '#19212a',
    fontSize: 19,
    fontWeight: '900',
  },
  cardTitleBlock: {
    flex: 1,
  },
  container: {
    backgroundColor: '#f6f7f3',
    flex: 1,
  },
  destination: {
    color: '#46515a',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  destinationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderColor: '#dfe4e8',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    padding: 20,
  },
  emptyText: {
    color: '#46515a',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  emptyTitle: {
    color: '#19212a',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  error: {
    color: '#b42318',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#dff3ef',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  list: {
    gap: 14,
    maxWidth: 680,
    padding: 24,
    paddingBottom: 118,
    width: '100%',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  stateText: {
    color: '#46515a',
    fontSize: 15,
    marginTop: 10,
  },
  stat: {
    backgroundColor: '#f6f7f3',
    borderRadius: 8,
    flex: 1,
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  statValue: {
    color: '#19212a',
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: '#46515a',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  title: {
    color: '#19212a',
    fontSize: 30,
    fontWeight: '900',
  },
});
