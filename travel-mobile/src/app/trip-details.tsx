import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createTripComment,
  getTripComments,
  getTripDetails,
  getTripPreferences,
  joinTrip,
  leaveTrip,
  saveTripPreferences,
  type TripComment,
  type TripDetails,
  type TripParticipantPreference,
  updateTripComment,
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
  const { isNavigationReady, isRestoring, token, user } = useRequireAuth();
  const tripId = Number(id);
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [comments, setComments] = useState<TripComment[]>([]);
  const [participantPreferences, setParticipantPreferences] = useState<TripParticipantPreference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCommentSaving, setIsCommentSaving] = useState(false);
  const [isPreferencesSaving, setIsPreferencesSaving] = useState(false);
  const [draftGuestsCount, setDraftGuestsCount] = useState(0);
  const [commentDraft, setCommentDraft] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [transportPreference, setTransportPreference] = useState('');
  const [accommodationPreference, setAccommodationPreference] = useState('');
  const [preferenceNote, setPreferenceNote] = useState('');
  const [isLeaveConfirmVisible, setIsLeaveConfirmVisible] = useState(false);

  const hasValidTripId = Number.isInteger(tripId) && tripId > 0;
  const guestsCount = trip?.userGuestsCount ?? 0;
  const canAddDraftGuest = useMemo(() => {
    if (!trip?.capacity) {
      return true;
    }

    if (!trip.isJoined) {
      return trip.participantsCount < trip.capacity;
    }

    const currentUserTotal = trip.userGuestsCount + 1;
    const nextUserTotal = draftGuestsCount + 2;

    return trip.participantsCount - currentUserTotal + nextUserTotal <= trip.capacity;
  }, [draftGuestsCount, trip]);
  const hasGuestChanges = draftGuestsCount !== guestsCount;

  const loadTrip = useCallback(async () => {
    if (!token || !hasValidTripId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextTrip = await getTripDetails(token, tripId);
      setTrip(nextTrip);
      setParticipantPreferences(nextTrip.participantPreferences ?? []);
      setTransportPreference(nextTrip.userTransportPreference || '');
      setAccommodationPreference(nextTrip.userAccommodationPreference || '');
      setPreferenceNote(nextTrip.userNote || '');

      const [nextComments, preferences] = await Promise.all([
        getTripComments(token, tripId),
        nextTrip.isJoined ? getTripPreferences(token, tripId) : Promise.resolve(null),
      ]);

      setComments(nextComments);

      if (preferences) {
        setTransportPreference(preferences.transportPreference || '');
        setAccommodationPreference(preferences.accommodationPreference || '');
        setPreferenceNote(preferences.note || '');
      }
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

  useEffect(() => {
    setDraftGuestsCount(guestsCount);
  }, [guestsCount]);

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

    setIsLeaveConfirmVisible(false);
    runMutation(() => leaveTrip(token, trip.id));
  }

  function handleSaveGuests() {
    if (!token || !trip || !hasGuestChanges) {
      return;
    }

    runMutation(() => updateTripGuests(token, trip.id, draftGuestsCount));
  }

  async function handleSavePreferences() {
    if (!token || !trip?.isJoined) {
      return;
    }

    setIsPreferencesSaving(true);
    setError(null);

    try {
      const updatedTrip = await saveTripPreferences(token, trip.id, {
        transportPreference,
        accommodationPreference,
        note: preferenceNote,
      });
      setTrip(updatedTrip);
      await loadTrip();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Предпочитанията не могат да бъдат запазени.',
      );
    } finally {
      setIsPreferencesSaving(false);
    }
  }

  async function handleSaveComment() {
    if (!token || !trip || !commentDraft.trim()) {
      return;
    }

    setIsCommentSaving(true);
    setError(null);

    try {
      if (editingCommentId) {
        const updatedComment = await updateTripComment(
          token,
          trip.id,
          editingCommentId,
          commentDraft,
        );
        setComments((current) =>
          current.map((comment) =>
            comment.id === updatedComment.id ? updatedComment : comment,
          ),
        );
      } else {
        const createdComment = await createTripComment(token, trip.id, commentDraft);
        setComments((current) => [createdComment, ...current]);
        setTrip((current) =>
          current
            ? { ...current, commentsCount: current.commentsCount + 1 }
            : current,
        );
      }

      setCommentDraft('');
      setEditingCommentId(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Коментарът не може да бъде запазен.');
    } finally {
      setIsCommentSaving(false);
    }
  }

  function handleEditComment(comment: TripComment) {
    setEditingCommentId(comment.id);
    setCommentDraft(comment.content);
  }

  function handleCancelCommentEdit() {
    setEditingCommentId(null);
    setCommentDraft('');
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
        <View style={styles.statusRow}>
          <Text style={[styles.status, trip.canceled && styles.canceledStatus]}>
            {trip.canceled ? 'Отменено' : trip.isJoined ? 'Участвате' : 'В групата'}
          </Text>
          {trip.isJoined ? (
            <Pressable
              disabled={isSaving}
              style={[styles.topDangerButton, isSaving && styles.disabledButton]}
              onPress={() => setIsLeaveConfirmVisible(true)}
            >
              <Text style={styles.topDangerButtonText}>Напусни</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.subtitle}>{trip.destination}</Text>
        <Text style={styles.meta}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
        <Text style={styles.meta}>{trip.groupName}</Text>
        <Text style={styles.meta}>
          {trip.participantsCount} участници
          {trip.capacity ? ` от максимум ${trip.capacity}` : ''}
        </Text>
        <Text style={styles.meta}>{trip.commentsCount} коментари</Text>
        <Text style={styles.meta}>{trip.preferencesCount} предпочитания</Text>

        {trip.description ? (
          <View style={styles.tripIntroBlock}>
            <Text style={styles.introLabel}>Описание</Text>
            <Text style={styles.body}>{trip.description}</Text>
          </View>
        ) : null}

        {trip.meetingPoint ? (
          <View style={styles.tripIntroBlock}>
            <Text style={styles.introLabel}>Място на среща</Text>
            <Text style={styles.body}>{trip.meetingPoint}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actionPanel}>
          <Text style={styles.sectionTitle}>Резервация</Text>
          {trip.isJoined ? (
            <>
              <Text style={styles.body}>Допълнителни гости към вашето участие.</Text>
              <View style={styles.stepper}>
                <Pressable
                  disabled={isSaving || draftGuestsCount === 0}
                  style={[styles.stepperButton, (isSaving || draftGuestsCount === 0) && styles.disabledButton]}
                  onPress={() => setDraftGuestsCount((current) => Math.max(0, current - 1))}
                >
                  <Text style={styles.stepperButtonText}>-</Text>
                </Pressable>
                <Text style={styles.guestsValue}>{draftGuestsCount}</Text>
                <Pressable
                  disabled={isSaving || !canAddDraftGuest}
                  style={[styles.stepperButton, (isSaving || !canAddDraftGuest) && styles.disabledButton]}
                  onPress={() => setDraftGuestsCount((current) => current + 1)}
                >
                  <Text style={styles.stepperButtonText}>+</Text>
                </Pressable>
              </View>
              <Pressable
                disabled={isSaving || !hasGuestChanges}
                style={[styles.primaryButton, (isSaving || !hasGuestChanges) && styles.disabledButton]}
                onPress={handleSaveGuests}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Запази гостите</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.body}>Присъединете се към пътуването, за да резервирате места.</Text>
              <Pressable
                disabled={isSaving || trip.canceled || !canAddDraftGuest}
                style={[styles.primaryButton, (isSaving || trip.canceled || !canAddDraftGuest) && styles.disabledButton]}
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

        <Modal
          animationType="fade"
          transparent
          visible={isLeaveConfirmVisible}
          onRequestClose={() => setIsLeaveConfirmVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.confirmDialog}>
              <Text style={styles.confirmBadge}>Внимание</Text>
              <Text style={styles.confirmTitle}>Да напуснете ли пътуването?</Text>
              <Text style={styles.confirmText}>
                Вашето участие и резервираните допълнителни гости ще бъдат премахнати.
              </Text>
              <View style={styles.confirmActions}>
                <Pressable
                  disabled={isSaving}
                  style={styles.cancelButton}
                  onPress={() => setIsLeaveConfirmVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Отказ</Text>
                </Pressable>
                <Pressable
                  disabled={isSaving}
                  style={[styles.confirmDangerButton, isSaving && styles.disabledButton]}
                  onPress={handleLeave}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.confirmDangerButtonText}>Напусни</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Предпочитания</Text>
          {trip.isJoined ? (
            <>
              <Text style={styles.body}>Запазете личните си предпочитания за това пътуване.</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Транспорт</Text>
                <TextInput
                  editable={!isPreferencesSaving}
                  maxLength={120}
                  onChangeText={setTransportPreference}
                  placeholder="напр. споделен автомобил"
                  style={styles.input}
                  value={transportPreference}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Настаняване</Text>
                <TextInput
                  editable={!isPreferencesSaving}
                  maxLength={120}
                  onChangeText={setAccommodationPreference}
                  placeholder="напр. двойна стая"
                  style={styles.input}
                  value={accommodationPreference}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Бележка</Text>
                <TextInput
                  editable={!isPreferencesSaving}
                  maxLength={500}
                  multiline
                  onChangeText={setPreferenceNote}
                  placeholder="Допълнителна информация към групата"
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={preferenceNote}
                />
              </View>
              <Pressable
                disabled={isPreferencesSaving}
                style={[styles.primaryButton, isPreferencesSaving && styles.disabledButton]}
                onPress={handleSavePreferences}
              >
                {isPreferencesSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Запази предпочитанията</Text>
                )}
              </Pressable>
            </>
          ) : (
            <Text style={styles.body}>Присъединете се към пътуването, за да добавите предпочитания.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Предпочитания на участниците</Text>
            <Text style={styles.countBadge}>{participantPreferences.length}</Text>
          </View>
          {participantPreferences.length > 0 ? (
            <View style={styles.preferencesList}>
              {participantPreferences.map((preference) => (
                <View key={preference.userId} style={styles.preferenceItem}>
                  <Text style={styles.preferenceAuthor}>{preference.userName}</Text>
                  <PreferenceLine label="Транспорт" value={preference.transportPreference} />
                  <PreferenceLine label="Настаняване" value={preference.accommodationPreference} />
                  <PreferenceLine label="Бележка" value={preference.note} />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.body}>Все още няма споделени предпочитания.</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.field}>
            <Text style={styles.label}>
              {editingCommentId ? 'Редактиране на коментар' : 'Нов коментар'}
            </Text>
            <TextInput
              editable={!isCommentSaving}
              maxLength={2000}
              multiline
              onChangeText={setCommentDraft}
              placeholder="Напишете коментар към групата"
              style={[styles.input, styles.textArea]}
              textAlignVertical="top"
              value={commentDraft}
            />
          </View>
          <View style={styles.inlineActions}>
            <Pressable
              disabled={isCommentSaving || !commentDraft.trim()}
              style={[
                styles.primaryButton,
                (isCommentSaving || !commentDraft.trim()) && styles.disabledButton,
              ]}
              onPress={handleSaveComment}
            >
              {isCommentSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {editingCommentId ? 'Запази коментара' : 'Добави коментар'}
                </Text>
              )}
            </Pressable>
            {editingCommentId ? (
              <Pressable
                disabled={isCommentSaving}
                style={styles.cancelButton}
                onPress={handleCancelCommentEdit}
              >
                <Text style={styles.cancelButtonText}>Отказ</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.commentsHeader}>
            <Text style={styles.sectionTitle}>Коментари на участниците</Text>
            <Text style={styles.countBadge}>{comments.length}</Text>
          </View>

          <View style={styles.commentsList}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.userName}</Text>
                    {comment.userId === user?.id ? (
                      <Pressable onPress={() => handleEditComment(comment)}>
                        <Text style={styles.editLink}>Редактирай</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.body}>Все още няма коментари.</Text>
            )}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

function PreferenceLine({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.preferenceLine}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Text style={styles.preferenceValue}>{value?.trim() || 'Не е зададено'}</Text>
    </View>
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
  commentAuthor: {
    color: '#19212a',
    fontSize: 15,
    fontWeight: '800',
  },
  commentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  commentItem: {
    borderTopWidth: 1,
    borderTopColor: '#e4e7ec',
    paddingTop: 14,
  },
  commentText: {
    color: '#46515a',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  commentsList: {
    gap: 14,
    marginTop: 18,
  },
  commentsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 24,
  },
  countBadge: {
    borderRadius: 999,
    backgroundColor: '#eef2f6',
    color: '#344054',
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  confirmBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#fee4e2',
    color: '#b42318',
    fontSize: 13,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  confirmDangerButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#dc2626',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmDangerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  confirmDialog: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    maxWidth: 420,
    padding: 22,
    width: '100%',
  },
  confirmText: {
    color: '#475467',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  confirmTitle: {
    color: '#101828',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f2',
    padding: 24,
  },
  content: {
    maxWidth: 620,
  },
  disabledButton: {
    opacity: 0.55,
  },
  editLink: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '800',
  },
  error: {
    color: '#b42318',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  field: {
    gap: 8,
    marginTop: 16,
  },
  guestsValue: {
    color: '#19212a',
    fontSize: 22,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'center',
  },
  inlineActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#19212a',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: '#27313b',
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: '#5c6873',
    fontSize: 15,
    marginTop: 8,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
  preferenceAuthor: {
    color: '#19212a',
    fontSize: 15,
    fontWeight: '800',
  },
  preferenceItem: {
    borderTopWidth: 1,
    borderTopColor: '#e4e7ec',
    gap: 8,
    paddingTop: 14,
  },
  preferenceLabel: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
  },
  preferenceLine: {
    gap: 3,
  },
  preferencesList: {
    gap: 14,
    marginTop: 18,
  },
  preferenceValue: {
    color: '#27313b',
    fontSize: 15,
    lineHeight: 22,
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
  sectionCard: {
    borderWidth: 1,
    borderColor: '#dfe4e8',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 24,
    padding: 18,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
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
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
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
  textArea: {
    minHeight: 96,
  },
  title: {
    color: '#19212a',
    fontSize: 30,
    fontWeight: '800',
  },
  topDangerButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#b42318',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  topDangerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  introLabel: {
    color: '#19212a',
    fontSize: 17,
    fontWeight: '800',
  },
  tripIntroBlock: {
    borderTopWidth: 1,
    borderTopColor: '#dfe4e8',
    marginTop: 18,
    paddingTop: 16,
  },
});
