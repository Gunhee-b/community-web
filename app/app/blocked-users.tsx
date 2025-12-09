import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import { getBlockedUsers, unblockUser } from '@/services/moderation';
import { supabase } from '@/services/supabase';

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
  blocked_user?: {
    username: string;
  };
}

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const result = await getBlockedUsers();

      if (result.success && result.data) {
        // Fetch user details for each blocked user
        const usersWithDetails = await Promise.all(
          result.data.map(async (block: any) => {
            const { data: userData } = await supabase
              .from('users')
              .select('username')
              .eq('id', block.blocked_id)
              .single();

            return {
              ...block,
              blocked_user: userData,
            };
          })
        );

        setBlockedUsers(usersWithDetails);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('오류', '차단 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string, username: string) => {
    Alert.alert(
      '차단 해제',
      `${username}님의 차단을 해제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '해제',
          onPress: async () => {
            setUnblocking(userId);

            const result = await unblockUser({ blockedUserId: userId });

            if (result.success) {
              Alert.alert('차단 해제 완료', `${username}님의 차단을 해제했습니다.`);
              fetchBlockedUsers();
            } else {
              Alert.alert('오류', result.error || '차단 해제에 실패했습니다.');
            }

            setUnblocking(null);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="차단 목록" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            차단 목록을 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="차단 목록" showBackButton />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {blockedUsers.length > 0 ? (
          <>
            <Text style={[styles.infoText, isDark && styles.textSecondaryDark]}>
              차단한 사용자의 콘텐츠가 표시되지 않습니다.
            </Text>

            {blockedUsers.map((block) => {
              const username = block.blocked_user?.username || '알 수 없음';
              const isUnblocking = unblocking === block.blocked_id;

              return (
                <View key={block.id} style={[styles.userCard, isDark && styles.userCardDark]}>
                  <View style={styles.userInfo}>
                    <LinearGradient
                      colors={['#FF3B30', '#FF9500']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>{username[0]}</Text>
                    </LinearGradient>
                    <View style={styles.userDetails}>
                      <Text style={[styles.username, isDark && styles.textDark]}>
                        {username}
                      </Text>
                      <Text style={[styles.blockedDate, isDark && styles.textSecondaryDark]}>
                        {new Date(block.created_at).toLocaleDateString('ko-KR')}에 차단
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.unblockButton,
                      isUnblocking && styles.unblockButtonDisabled,
                    ]}
                    onPress={() => handleUnblock(block.blocked_id, username)}
                    disabled={isUnblocking}
                  >
                    {isUnblocking ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Text style={styles.unblockButtonText}>차단 해제</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        ) : (
          <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
            <Ionicons
              name="person-remove-outline"
              size={64}
              color={isDark ? '#636366' : '#9CA3AF'}
            />
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
              차단한 사용자가 없습니다
            </Text>
            <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
              사용자를 차단하면 여기에 표시됩니다
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },

  // Info Text
  infoText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },

  // User Card
  userCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  userCardDark: {
    backgroundColor: '#1C1C1E',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  blockedDate: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },

  // Unblock Button
  unblockButton: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  unblockButtonDisabled: {
    opacity: 0.6,
  },
  unblockButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyContainerDark: {
    backgroundColor: 'transparent',
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: '#333',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Text Colors
  textDark: {
    color: 'white',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
});
