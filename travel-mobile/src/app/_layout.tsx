import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#f6f7f3' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleAlign: 'center',
          headerTitleStyle: { color: '#19212a', fontWeight: '800' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Начало' }} />
        <Stack.Screen name="login" options={{ title: 'Вход' }} />
        <Stack.Screen name="register" options={{ title: 'Регистрация' }} />
        <Stack.Screen name="groups" options={{ title: 'Групи' }} />
        <Stack.Screen name="trips" options={{ title: 'Пътувания' }} />
        <Stack.Screen name="profile" options={{ title: 'Профил' }} />
        <Stack.Screen name="trip-details" options={{ title: 'Детайли' }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
