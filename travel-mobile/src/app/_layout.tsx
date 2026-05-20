import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#ffffff' },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Начало' }} />
        <Stack.Screen name="login" options={{ title: 'Вход' }} />
        <Stack.Screen name="trips" options={{ title: 'Пътувания' }} />
        <Stack.Screen name="trip-details" options={{ title: 'Детайли' }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
