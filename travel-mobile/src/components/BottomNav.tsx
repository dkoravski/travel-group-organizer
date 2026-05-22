import { Ionicons } from '@expo/vector-icons';
import { Link, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth-context';

const publicItems = [
  { href: '/', icon: 'home', inactiveIcon: 'home-outline', label: 'Начало' },
  { href: '/login', icon: 'log-in', inactiveIcon: 'log-in-outline', label: 'Вход' },
  { href: '/register', icon: 'person-add', inactiveIcon: 'person-add-outline', label: 'Регистрация' },
] as const;

const userItems = [
  { href: '/', icon: 'home', inactiveIcon: 'home-outline', label: 'Начало' },
  { href: '/groups', icon: 'people', inactiveIcon: 'people-outline', label: 'Групи' },
  { href: '/trips', icon: 'airplane', inactiveIcon: 'airplane-outline', label: 'Пътувания' },
  { href: '/profile', icon: 'person-circle', inactiveIcon: 'person-circle-outline', label: 'Профил' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { token, signOut } = useAuth();
  const items = token ? userItems : publicItems;

  function handleSignOut() {
    signOut();
    router.replace('/');
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          const iconName = isActive ? item.icon : item.inactiveIcon;

          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable style={styles.item}>
                <View style={[styles.iconWrap, isActive && styles.activeIconWrap]}>
                  <Ionicons
                    name={iconName}
                    size={21}
                    color={isActive ? '#0f766e' : '#667085'}
                  />
                </View>
                <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
              </Pressable>
            </Link>
          );
        })}
        {token ? (
          <Pressable style={styles.item} onPress={handleSignOut}>
            <View style={styles.iconWrap}>
              <Ionicons name="log-out-outline" size={21} color="#b42318" />
            </View>
            <Text style={[styles.label, styles.dangerLabel]}>Изход</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: '#dff3ef',
  },
  activeLabel: {
    color: '#0f766e',
  },
  bar: {
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dfe4e8',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    maxWidth: 620,
    paddingHorizontal: 6,
    paddingVertical: 7,
    width: '100%',
  },
  dangerLabel: {
    color: '#b42318',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 34,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    minHeight: 50,
  },
  label: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '800',
  },
  wrapper: {
    backgroundColor: 'rgba(246, 247, 243, 0.96)',
    borderTopColor: '#e0e5e8',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    position: 'absolute',
    right: 0,
  },
});
