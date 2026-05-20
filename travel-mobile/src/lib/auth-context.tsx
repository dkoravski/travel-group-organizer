import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import type { ApiUser } from './api';

type AuthContextValue = {
  token: string | null;
  user: ApiUser | null;
  signIn: (token: string, user: ApiUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);

  const value = useMemo(
    () => ({
      token,
      user,
      signIn: (nextToken: string, nextUser: ApiUser) => {
        setToken(nextToken);
        setUser(nextUser);
      },
      signOut: () => {
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
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
