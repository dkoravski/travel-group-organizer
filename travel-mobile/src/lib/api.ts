import { Platform } from 'react-native';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = (
  configuredApiBaseUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api')
).replace(/\/$/, '');

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type LoginResponse = {
  token: string;
  tokenType: 'Bearer';
  user: ApiUser;
};

export type RegisterResponse = LoginResponse;

export type TripSummary = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  canceled: boolean;
  groupName: string;
  participantsCount: number;
  commentsCount: number;
  preferencesCount: number;
  isJoined: boolean;
};

export type UserGroup = {
  id: number;
  name: string;
  description: string | null;
  visibility: 'public' | 'private';
  role: 'member' | 'manager';
  createdAt: string;
  membersCount: number;
  tripsCount: number;
};

export type TripDetails = TripSummary & {
  groupId: number;
  description: string | null;
  meetingPoint: string | null;
  capacity: number | null;
  estimatedBudget: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isGroupMember: boolean;
  userGuestsCount: number;
  userTransportPreference: string | null;
  userAccommodationPreference: string | null;
  userNote: string | null;
  comments?: TripComment[];
  participantPreferences?: TripParticipantPreference[];
};

export type TripPreferences = {
  tripId: number;
  userId: number;
  transportPreference: string | null;
  accommodationPreference: string | null;
  note: string | null;
};

export type TripComment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
};

export type TripParticipantPreference = {
  userId: number;
  userName: string;
  transportPreference: string | null;
  accommodationPreference: string | null;
  note: string | null;
};

export type TripsPage = {
  data: TripSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

async function readApiResponse<T>(response: Response, fallbackError: string) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!isJson) {
    throw new Error(
      'API адресът не връща JSON. Проверете EXPO_PUBLIC_API_BASE_URL и дали сочи към backend адрес, завършващ на /api.',
    );
  }

  if (!response.ok) {
    const apiError =
      typeof body === 'object' && body !== null && 'error' in body
        ? String(body.error)
        : null;

    throw new Error(apiError || fallbackError);
  }

  return body as T;
}

async function apiFetch(input: string, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error('Няма връзка с API сървъра. Проверете EXPO_PUBLIC_API_BASE_URL и дали backend-ът работи.');
  }
}

export async function login(email: string, password: string) {
  const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return readApiResponse<LoginResponse>(response, 'Неуспешен вход.');
}

export async function register(name: string, email: string, password: string) {
  const response = await apiFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return readApiResponse<RegisterResponse>(response, 'Неуспешна регистрация.');
}

export async function getProfile(token: string) {
  const response = await apiFetch(`${API_BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await readApiResponse<{ data: ApiUser }>(
    response,
    'Профилът не може да бъде зареден.',
  );

  return body.data;
}

export async function updateProfileName(token: string, name: string) {
  const response = await apiFetch(`${API_BASE_URL}/profile`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const body = await readApiResponse<{ data: ApiUser }>(
    response,
    'Името не може да бъде обновено.',
  );

  return body.data;
}

export async function changeProfilePassword(
  token: string,
  passwords: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  },
) {
  const response = await apiFetch(`${API_BASE_URL}/profile/password`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwords),
  });

  return readApiResponse<{ message: string }>(
    response,
    'Паролата не може да бъде сменена.',
  );
}

export async function getTrips(token: string) {
  const response = await apiFetch(`${API_BASE_URL}/trips?page=1&pageSize=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return readApiResponse<TripsPage>(response, 'Пътуванията не могат да бъдат заредени.');
}

export async function getGroups(token: string) {
  const response = await apiFetch(`${API_BASE_URL}/groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await readApiResponse<{ data: UserGroup[] }>(
    response,
    'Групите не могат да бъдат заредени.',
  );

  return body.data;
}

export async function getTripDetails(token: string, tripId: number) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await readApiResponse<{ data: TripDetails }>(
    response,
    'Детайлите за пътуването не могат да бъдат заредени.',
  );

  return body.data;
}

async function mutateTrip(
  token: string,
  tripId: number,
  action: 'join' | 'leave' | 'guests',
  guestsCount?: number,
) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}/${action}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: guestsCount === undefined ? undefined : JSON.stringify({ guestsCount }),
  });

  const body = await readApiResponse<{ data: TripDetails }>(
    response,
    'Пътуването не може да бъде обновено.',
  );

  return body.data;
}

export function joinTrip(token: string, tripId: number, guestsCount = 0) {
  return mutateTrip(token, tripId, 'join', guestsCount);
}

export function leaveTrip(token: string, tripId: number) {
  return mutateTrip(token, tripId, 'leave');
}

export function updateTripGuests(token: string, tripId: number, guestsCount: number) {
  return mutateTrip(token, tripId, 'guests', guestsCount);
}

export async function getTripPreferences(token: string, tripId: number) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}/preferences`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await readApiResponse<{ data: TripPreferences }>(
    response,
    'Предпочитанията не могат да бъдат заредени.',
  );

  return body.data;
}

export async function saveTripPreferences(
  token: string,
  tripId: number,
  preferences: {
    transportPreference: string;
    accommodationPreference: string;
    note: string;
  },
) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });

  const body = await readApiResponse<{ data: TripDetails }>(
    response,
    'Предпочитанията не могат да бъдат запазени.',
  );

  return body.data;
}

export async function getTripComments(token: string, tripId: number) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}/comment`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await readApiResponse<{ data: TripComment[] }>(
    response,
    'Коментарите не могат да бъдат заредени.',
  );

  return body.data;
}

export async function createTripComment(token: string, tripId: number, content: string) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}/comment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const body = await readApiResponse<{ data: TripComment }>(
    response,
    'Коментарът не може да бъде добавен.',
  );

  return body.data;
}

export async function updateTripComment(
  token: string,
  tripId: number,
  commentId: number,
  content: string,
) {
  const response = await apiFetch(`${API_BASE_URL}/trips/${tripId}/comment/${commentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const body = await readApiResponse<{ data: TripComment }>(
    response,
    'Коментарът не може да бъде редактиран.',
  );

  return body.data;
}
