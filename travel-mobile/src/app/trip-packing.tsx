import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InteractivePressable } from '@/components/InteractivePressable';
import {
  getTripPackingItems,
  updatePackingItemCheck,
  type PackingItem,
} from '@/lib/api';
import { useRequireAuth } from '@/lib/use-require-auth';

export default function TripPackingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isNavigationReady, isRestoring, token } = useRequireAuth();
  const tripId = Number(id);
  const [items, setItems] = useState<PackingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const hasValidTripId = Number.isInteger(tripId) && tripId > 0;
  const checkedCount = items.filter((item) => item.checked).length;

  const loadPackingItems = useCallback(async () => {
    if (!token || !hasValidTripId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextItems = await getTripPackingItems(token, tripId);
      setItems(nextItems);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Списъкът за багаж не може да бъде зареден.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasValidTripId, token, tripId]);

  useEffect(() => {
    if (token && hasValidTripId) {
      loadPackingItems();
    }
  }, [hasValidTripId, loadPackingItems, token]);

  async function handleToggle(item: PackingItem) {
    if (!token || updatingItemId) {
      return;
    }

    setUpdatingItemId(item.id);
    setError(null);

    try {
      const nextItems = await updatePackingItemCheck(
        token,
        tripId,
        item.id,
        !item.checked,
      );
      setItems(nextItems);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Артикулът не може да бъде обновен.',
      );
    } finally {
      setUpdatingItemId(null);
    }
  }

  if (!isNavigationReady || isRestoring || !token) {
    return null;
  }

  if (!hasValidTripId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Невалидно пътуване.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <InteractivePressable feedback="quiet" style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
          <Text style={styles.backButtonText}>Назад</Text>
        </InteractivePressable>

        <Text style={styles.title}>Списък за багаж</Text>
        <Text style={styles.subtitle}>
          {checkedCount} от {items.length} подготвени
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color="#0f766e" />
          <Text style={styles.stateText}>Зареждане на списъка...</Text>
        </View>
      ) : items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <InteractivePressable
              key={item.id}
              disabled={updatingItemId !== null}
              feedback="card"
              style={styles.item}
              onPress={() => handleToggle(item)}
            >
              <View style={[styles.checkbox, item.checked && styles.checkedBox]}>
                {item.checked ? (
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                ) : null}
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, item.checked && styles.checkedText]}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
              </View>
            </InteractivePressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="bag-handle-outline" size={28} color="#0f766e" />
          <Text style={styles.emptyTitle}>Няма добавени артикули</Text>
          <Text style={styles.emptyText}>
            Мениджърът на пътуването все още не е добавил списък за багаж.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#d0d5dd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  backButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#cbd5e1',
    borderRadius: 6,
    borderWidth: 1,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  checkedBox: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  checkedText: {
    color: '#667085',
    textDecorationLine: 'line-through',
  },
  container: {
    backgroundColor: '#f6f7f3',
    flexGrow: 1,
    padding: 24,
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
    marginTop: 16,
  },
  header: {
    maxWidth: 680,
  },
  item: {
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderColor: '#dfe4e8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    color: '#5c6873',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  itemTitle: {
    color: '#19212a',
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    gap: 12,
    marginTop: 20,
    maxWidth: 680,
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
    marginTop: 8,
  },
  title: {
    color: '#19212a',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 24,
  },
});
