import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TopNavBar } from '@/components/navigation';
import { Button } from '@/components/common';
import { useAuthStore } from '@/store';

/**
 * ProfileScreen
 *
 * 프로필 화면 (TODO: 구현 예정)
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // _layout.tsx가 자동으로 로그인 화면으로 이동시킴
  };

  return (
    <View style={styles.container}>
      <TopNavBar title="프로필" />
      <View style={styles.content}>
        <Text style={styles.text}>프로필 화면 (구현 예정)</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        )}
        <Button
          title="로그아웃"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
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
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    minWidth: 200,
  },
});
