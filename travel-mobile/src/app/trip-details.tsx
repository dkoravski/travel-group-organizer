import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  getTripDetails,
  joinTrip,
  leaveTrip,
  type TripDetails,
  updateTripGuests,
} from '@/lib/api';
import { useRequireAuth } from '@/lib/use-require-auth';

function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isNavigationReady, isRestoring, token } = useRequireAuth();
  const tripId = Number(id);
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasValidTripId = Number.isInteger(tripId) && tripId > 0;
  const guestsCount = trip?.userGuestsCount ?? 0;
  const isAtCapacity = useMemo(() => {
    if (!trip?.capacity) {
      return false;
    }

    return trip.participantsCount >= trip.capacity;
  }, [trip]);

  const loadTrip = useCallback(async () => {
    if (!token || !hasValidTripId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextTrip = await getTripDetails(token, tripId);
      setTrip(nextTrip);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Детайлите за пътуването не могат да бъдат заредени.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasValidTripId, token, tripId]);

  useEffect(() => {
    if (token && hasValidTripId) {
      loadTrip();
    }
  }, [hasValidTripId, loadTrip, token]);

  async function runMutation(action: () => Promise<TripDetails>) {
    setIsSaving(true);
    setError(null);

    try {
      const updatedTrip = await action();
      setTrip(updatedTrip);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Пътуването не може да бъде обновено.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleJoin() {
    if (!token || !trip) {
      return;
    }

    runMutation(() => joinTrip(token, trip.id, guestsCount));
  }

  function handleLeave() {
    if (!token || !trip) {
      return;
    }

    runMutation(() => leaveTrip(token, trip.id));
  }

  function handleGuestsChange(nextGuestsCount: number) {
    if (!token || !trip || nextGuestsCount < 0) {
      return;
    }

    runMutation(() => updateTripGuests(token, trip.id, nextGuestsCount));
  }

  if (!isNavigationReady || isRestoring || !token) {
    return null;
  }

  if (!hasValidTripId) {
    return (
      <View style={styles.container}>
        <View style={styles.state}>
          <Text style={styles.error}>Невалидно пътуване.</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.state}>
          <ActivityIndicator color="#0f766e" />
          <Text style={styles.stateText}>Зареждане на детайли...</Text>
        </View>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <View style={styles.state}>
          <Text style={styles.error}>{error || 'Пътуването не е намерено.'}</Text>
          <Pressable style={styles.retryButton} onPress={loadTrip}>
            <Text style={styles.retryText}>Опитай пак</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.status, trip.canceled && styles.canceledStatus]}>
          {trip.canceled ? 'Отменено' : trip.isJoined ? 'Участвате' : 'В групата'}
        </Text>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.subtitle}>{trip.destination}</Text>
        <Text style={styles.meta}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
        <Text style={styles.meta}>{trip.groupName}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actionPanel}>
          <Text style={styles.sectionTitle}>Резервация</Text>
          {trip.isJoined ? (
            <>
              <Text style={styles.body}>Допълнителни гости към вашето участие.</Text>
              <View style={styles.stepper}>
                <Pressable
                  disabled={isSaving || guestsCount === 0}
                  style={[styles.stepperButton, (isSaving || guestsCount === 0) && styles.disabledButton]}
                  onPress={() => handleGuestsChange(guestsCount - 1)}
                >
                  <Text style={styles.stepperButtonText}>-</Text>
                </Pressable>
                <Text style={styles.guestsValue}>{guestsCount}</Text>
                <Pressable
                  disabled={isSaving || isAtCapacity}
                  style={[styles.stepperButton, (isSaving || isAtCapacity) && styles.disabledButton]}
                  onPress={() => handleGuestsChange(guestsCount + 1)}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
              <Pressable
                disabled={isSaving}
                style={[styles.dangerButton, isSaving && styles.disabledButton]}
                onPress={handleLeave}
              >
                <Text style={styles.dangerButtonText}>Напусни</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.body}>Присъединете се към пътуването, за да резервирате места.</Text>
              <Pressable
                disabled={isSaving || trip.canceled || isAtCapacity}
                style={[styles.primaryButton, (isSaving || trip.canceled || isAtCapacity) && styles.disabledButton]}
                onPress={handleJoin}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Присъедини се</Text>
                )}
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Участници</Text>
          <Text style={styles.body}>
            {trip.participantsCount} участници
            {trip.capacity ? ` от максимум ${trip.capacity}` : ''}
          </Text>
        </View>

        {trip.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.body}>{trip.description}</Text>
          </View>
        ) : null}

        {trip.meetingPoint ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Място на среща</Text>
            <Text style={styles.body}>{trip.meetingPoint}</Text>
          </View>
        ) : null}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    borderWidth: 1,
    borderColor: '#dfe4e8',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 24,
    padding: 18,
  },
  body: {
    color: '#46515a',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 6,
  },
  canceledStatus: {
    backgroundColor: '#fee4e2',
    color: '#b42318',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f2',
    padding: 24,
  },
  content: {
    maxWidth: 620,
  },
  dangerButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#b42318',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.55,
  },
  error: {
    color: '#b42318',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  guestsValue: {
    color: '#19212a',
    fontSize: 22,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'center',
  },
  meta: {
    color: '#5c6873',
    fontSize: 15,
    marginTop: 8,
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#0f766e',
    marginTop: 18,
    minWidth: 150,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
  state: {
    alignItems: 'flex-start',
    marginTop: 24,
  },
  stateText: {
    color: '#46515a',
    fontSize: 15,
    marginTop: 10,
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
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginTop: 18,
  },
  stepperButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0f766e',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  stepperButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    color: '#27313b',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  title: {
    color: '#19212a',
    fontSize: 30,
    fontWeight: '800',
  },
});
