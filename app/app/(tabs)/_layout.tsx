import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';

/**
 * Tabs Layout - Bottom Navigation
 *
 * 메인 화면의 하단 탭 네비게이션
 * - Home (홈)
 * - Meetings (철학챗)
 * - Questions (질문)
 * - Profile (프로필)
 */
export default function TabLayout() {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#8E8E93' : '#999999',
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopColor: isDark ? '#38383A' : '#E5E5E7',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 34,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: '철학챗',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="questions"
        options={{
          title: '질문',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // 탭에서 숨김
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // 탭에서 숨김
        }}
      />
    </Tabs>
  );
}
