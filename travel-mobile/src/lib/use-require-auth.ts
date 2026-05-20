import { router, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from './auth-context';

export function useRequireAuth() {
  const auth = useAuth();
  const rootNavigationState = useRootNavigationState();
  const isNavigationReady = Boolean(rootNavigationState?.key);

  useEffect(() => {
    if (isNavigationReady && !auth.isRestoring && !auth.token) {
      router.replace('/login');
    }
  }, [auth.isRestoring, auth.token, isNavigationReady]);

  return {
    ...auth,
    isNavigationReady,
  };
}
