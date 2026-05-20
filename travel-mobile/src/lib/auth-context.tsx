import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { ApiUser } from './api';

const storedAuthKey = 'travel-group-organizer.auth';

type AuthContextValue = {
  isRestoring: boolean;
  token: string | null;
  user: ApiUser | null;
  signIn: (token: string, user: ApiUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setIsRestoring(false);
      return;
    }

    try {
      const storedAuth = window.localStorage.getItem(storedAuthKey);

      if (storedAuth) {
        const parsed = JSON.parse(storedAuth) as { token?: string; user?: ApiUser };

        if (parsed.token && parsed.user) {
          setToken(parsed.token);
          setUser(parsed.user);
        }
      }
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isRestoring,
      token,
      user,
      signIn: (nextToken: string, nextUser: ApiUser) => {
        setToken(nextToken);
        setUser(nextUser);

        if (Platform.OS === 'web') {
          window.localStorage.setItem(
            storedAuthKey,
            JSON.stringify({ token: nextToken, user: nextUser }),
          );
        }
      },
      signOut: () => {
        setToken(null);
        setUser(null);

        if (Platform.OS === 'web') {
          window.localStorage.removeItem(storedAuthKey);
        }
      },
    }),
    [isRestoring, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
