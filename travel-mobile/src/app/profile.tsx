import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { InteractivePressable } from '@/components/InteractivePressable';
import {
  changeProfilePassword,
  getProfile,
  updateProfileName,
  type ApiUser,
} from '@/lib/api';
import { useRequireAuth } from '@/lib/use-require-auth';

function getInitials(name?: string | null) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'П';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const { isNavigationReady, isRestoring, token, user, updateUser } = useRequireAuth();
  const [profile, setProfile] = useState<ApiUser | null>(user);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNameSaving, setIsNameSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const initials = useMemo(() => getInitials(profile?.name || user?.name), [profile?.name, user?.name]);

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const loadProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextProfile = await getProfile(token);
      setProfile(nextProfile);
      updateUser(nextProfile);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Профилът не може да бъде зареден.');
    } finally {
      setIsLoading(false);
    }
  }, [token, updateUser]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        loadProfile();
      }
    }, [loadProfile, token]),
  );

  async function handleSaveName() {
    if (!token) {
      return;
    }

    if (name.trim().length < 2) {
      setError('Името трябва да бъде поне 2 символа.');
      setSuccess(null);
      return;
    }

    setIsNameSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateProfileName(token, name);
      setProfile(updated);
      updateUser(updated);
      setSuccess('Името е обновено успешно.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Името не може да бъде обновено.');
    } finally {
      setIsNameSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!token) {
      return;
    }

    setIsPasswordSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await changeProfilePassword(token, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(result.message || 'Паролата е сменена успешно.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Паролата не може да бъде сменена.');
    } finally {
      setIsPasswordSaving(false);
    }
  }

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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{profile?.name || user?.name || 'Потребител'}</Text>
            <Text style={styles.subtitle}>{profile?.email || user?.email}</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#0f766e" />
            <Text style={styles.stateText}>Зареждане на профила...</Text>
          </View>
        ) : (
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <View style={styles.cardsColumn}>
              <View style={styles.nameCard}>
                <Text style={styles.sectionTitle}>Име</Text>
                <View style={styles.nameGrid}>
                  <View style={styles.nameField}>
                  <Text style={styles.label}>Име</Text>
                  <TextInput
                    editable={!isNameSaving}
                    onChangeText={setName}
                    placeholder="Вашето име"
                    style={styles.input}
                    value={name}
                  />
                  </View>
                  <View style={styles.nameSide}>
                    <View style={styles.readOnlyRow}>
                      <Ionicons name="mail-outline" size={17} color="#667085" />
                      <Text style={styles.readOnlyText}>{profile?.email || user?.email}</Text>
                    </View>
                    <InteractivePressable
                      disabled={isNameSaving}
                      feedback="primary"
                      style={[styles.primaryButton, isNameSaving && styles.disabledButton]}
                      onPress={handleSaveName}
                    >
                      {isNameSaving ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Запази</Text>
                      )}
                    </InteractivePressable>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Парола</Text>
                <View style={styles.field}>
                  <Text style={styles.label}>Текуща</Text>
                  <TextInput
                    editable={!isPasswordSaving}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    style={styles.input}
                    value={currentPassword}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Нова</Text>
                  <TextInput
                    editable={!isPasswordSaving}
                    onChangeText={setNewPassword}
                    placeholder="Минимум 6 символа"
                    secureTextEntry
                    style={styles.input}
                    value={newPassword}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Потвърди</Text>
                  <TextInput
                    editable={!isPasswordSaving}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                    value={confirmPassword}
                  />
                </View>
                <InteractivePressable
                  disabled={isPasswordSaving}
                  feedback="primary"
                  style={[styles.primaryButton, isPasswordSaving && styles.disabledButton]}
                  onPress={handleChangePassword}
                >
                  {isPasswordSaving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Смени</Text>
                  )}
                </InteractivePressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#dff3ef',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: '#0f766e',
    fontSize: 20,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e5e8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
    width: '100%',
  },
  cardsColumn: {
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  nameCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e5e8',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
    width: '100%',
  },
  nameGrid: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nameField: {
    flex: 1,
    minWidth: 210,
  },
  nameSide: {
    flex: 1,
    gap: 8,
    minWidth: 210,
  },
  container: {
    maxWidth: 840,
    paddingBottom: 98,
    paddingHorizontal: 18,
    paddingTop: 10,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.7,
  },
  error: {
    color: '#b42318',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  field: {
    gap: 5,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
  },
  headerCopy: {
    flex: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d4d8dd',
    borderRadius: 8,
    borderWidth: 1,
    color: '#19212a',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    color: '#27313b',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0f766e',
    borderRadius: 8,
    minWidth: 110,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  readOnlyRow: {
    alignItems: 'center',
    backgroundColor: '#f6f7f3',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readOnlyText: {
    color: '#46515a',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#f6f7f3',
    flex: 1,
  },
  sectionTitle: {
    color: '#19212a',
    fontSize: 15,
    fontWeight: '900',
  },
  state: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  stateCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e5e8',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  stateText: {
    color: '#46515a',
    fontSize: 14,
    marginTop: 10,
  },
  subtitle: {
    color: '#46515a',
    fontSize: 14,
    marginTop: 3,
  },
  success: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 10,
  },
  title: {
    color: '#19212a',
    fontSize: 22,
    fontWeight: '900',
  },
});
