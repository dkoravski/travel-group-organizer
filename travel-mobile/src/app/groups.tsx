import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { InteractivePressable } from '@/components/InteractivePressable';
import { getGroups, type UserGroup } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-require-auth';

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function GroupsScreen() {
  const { isNavigationReady, isRestoring, token, user } = useRequireAuth();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextGroups = await getGroups(token);
      setGroups(nextGroups);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Групите не могат да бъдат заредени.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadGroups();
      }
    }, [loadGroups, token]),
  );

  if (!isNavigationReady || isRestoring || !token) {
    return (
      <View style={styles.screen}>
        <View style={styles.state}>
          <ActivityIndicator color="#0f766e" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.list}
        data={isLoading || error ? [] : groups}
        keyExtractor={(group) => String(group.id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name="people" size={22} color="#0f766e" />
            </View>
            <Text style={styles.title}>Моите групи</Text>
            <Text style={styles.subtitle}>
              {user?.name ? `${user.name}, това са групите, в които участвате.` : 'Групите, в които участвате.'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color="#0f766e" />
              <Text style={styles.stateText}>Зареждане на групи...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <Ionicons name="warning-outline" size={26} color="#b42318" />
              <Text style={styles.error}>{error}</Text>
              <InteractivePressable feedback="primary" style={styles.retryButton} onPress={loadGroups}>
                <Text style={styles.retryText}>Опитай пак</Text>
              </InteractivePressable>
            </View>
          ) : (
            <View style={styles.stateCard}>
              <Ionicons name="people-outline" size={28} color="#0f766e" />
              <Text style={styles.emptyTitle}>Няма групи</Text>
              <Text style={styles.emptyText}>
                Когато създадете или се присъедините към група, тя ще се покаже тук.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardText}>
                  {item.description?.trim() || 'Няма добавено описание.'}
                </Text>
              </View>
              <Text style={[styles.badge, item.role === 'manager' && styles.managerBadge]}>
                {item.role === 'manager' ? 'Мениджър' : 'Член'}
              </Text>
            </View>
            <View style={styles.metaGrid}>
              <Meta icon="people-outline" label="членове" value={item.membersCount} />
              <Meta icon="airplane-outline" label="пътувания" value={item.tripsCount} />
              <Meta
                icon="calendar-clear-outline"
                label="създадена"
                value={formatCreatedAt(item.createdAt)}
              />
            </View>
          </View>
        )}
      />
      <BottomNav />
    </View>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color="#667085" />
      <View>
        <Text style={styles.metaValue}>{value}</Text>
        <Text style={styles.metaLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#eef2f6',
    borderRadius: 999,
    color: '#344054',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#dfe4e8',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardText: {
    color: '#5c6873',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  cardTitle: {
    color: '#19212a',
    fontSize: 18,
    fontWeight: '900',
  },
  cardTitleBlock: {
    flex: 1,
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
    marginBottom: 18,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#dff3ef',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    marginBottom: 14,
    width: 44,
  },
  list: {
    gap: 12,
    maxWidth: 680,
    padding: 24,
    paddingBottom: 118,
    width: '100%',
  },
  managerBadge: {
    backgroundColor: '#dff3ef',
    color: '#0f766e',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  metaItem: {
    alignItems: 'center',
    backgroundColor: '#f6f7f3',
    borderRadius: 8,
    flexDirection: 'row',
    flexGrow: 1,
    gap: 8,
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  metaLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  metaValue: {
    color: '#19212a',
    fontSize: 15,
    fontWeight: '900',
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
  screen: {
    backgroundColor: '#f6f7f3',
    flex: 1,
  },
  state: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  stateCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dfe4e8',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 18,
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
    fontSize: 30,
    fontWeight: '900',
  },
});
