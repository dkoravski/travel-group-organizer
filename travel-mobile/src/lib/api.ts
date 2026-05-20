import { Platform } from 'react-native';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL =
  configuredApiBaseUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

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

export type TripsPage = {
  data: TripSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
  const response = await fetch(`${API_BASE_URL}/api/trips?page=1&pageSize=50`, {
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
