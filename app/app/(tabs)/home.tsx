import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { TopNavBar } from '@/components/navigation';
import { useNotificationStore } from '@/store';

/**
 * HomeScreen
 *
 * 홈 화면 (TODO: 구현 예정)
 * - 오늘의 질문 배너
 * - 다가오는 모임 캐러셀
 * - 최근 활동 피드
 */
export default function HomeScreen() {
  const router = useRouter();
  const { unreadCount } = useNotificationStore();

  return (
    <View style={styles.container}>
      <TopNavBar
        title="INGK Community"
        onNotifications={() => router.push('/(tabs)/notifications' as any)}
        notificationCount={unreadCount}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>홈 화면 (구현 예정)</Text>
        <Text style={styles.subtext}>
          • 오늘의 질문 배너{'\n'}
          • 다가오는 모임 캐러셀{'\n'}
          • 최근 활동 피드
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
});
