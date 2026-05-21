import { Platform } from 'react-native';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL =
  configuredApiBaseUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');

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

export type TripSummary = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  canceled: boolean;
  groupName: string;
  participantsCount: number;
  isJoined: boolean;
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

export type TripsPage = {
  data: TripSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Неуспешен вход.');
  }

  return body as LoginResponse;
}

export async function getTrips(token: string) {
  const response = await fetch(`${API_BASE_URL}/trips?page=1&pageSize=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Пътуванията не могат да бъдат заредени.');
  }

  return body as TripsPage;
}

export async function getTripDetails(token: string, tripId: number) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Детайлите за пътуването не могат да бъдат заредени.');
  }

  return body.data as TripDetails;
}

async function mutateTrip(
  token: string,
  tripId: number,
  action: 'join' | 'leave' | 'guests',
  guestsCount?: number,
) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/${action}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: guestsCount === undefined ? undefined : JSON.stringify({ guestsCount }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Пътуването не може да бъде обновено.');
  }

  return body.data as TripDetails;
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
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/preferences`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Предпочитанията не могат да бъдат заредени.');
  }

  return body.data as TripPreferences;
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
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Предпочитанията не могат да бъдат запазени.');
  }

  return body.data as TripDetails;
}

export async function getTripComments(token: string, tripId: number) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/comment`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Коментарите не могат да бъдат заредени.');
  }

  return body.data as TripComment[];
}

export async function createTripComment(token: string, tripId: number, content: string) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/comment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Коментарът не може да бъде добавен.');
  }

  return body.data as TripComment;
}

export async function updateTripComment(
  token: string,
  tripId: number,
  commentId: number,
  content: string,
) {
  const response = await fetch(`${API_BASE_URL}/trips/${tripId}/comment/${commentId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error || 'Коментарът не може да бъде редактиран.');
  }

  return body.data as TripComment;
}
