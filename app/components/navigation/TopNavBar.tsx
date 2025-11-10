import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store';

interface TopNavBarProps {
  title: string;
  onBack?: () => void;
  onNotifications?: () => void;
  notificationCount?: number;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
}

/**
 * TopNavBar Component
 *
 * 상단 네비게이션 바
 * - 뒤로가기 버튼
 * - 제목
 * - 알림 버튼
 * - 커스텀 오른쪽 액션
 *
 * @example
 * ```tsx
 * <TopNavBar
 *   title="홈"
 *   onNotifications={() => router.push('/notifications')}
 *   notificationCount={3}
 * />
 * ```
 */
export default function TopNavBar({
  title,
  onBack,
  onNotifications,
  notificationCount = 0,
  rightAction,
  showBackButton = false,
}: TopNavBarProps) {
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        isDark && styles.containerDark,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Back Button */}
        <View style={styles.leftSection}>
          {(showBackButton || onBack) && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="chevron-back"
                size={28}
                color={isDark ? 'white' : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center: Title */}
        <View style={styles.titleSection}>
          <Text
            style={[styles.title, isDark && styles.titleDark]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right: Notifications or Custom Action */}
        <View style={styles.rightSection}>
          {rightAction}
          {onNotifications && (
            <TouchableOpacity
              onPress={onNotifications}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={isDark ? 'white' : theme.colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#38383A',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: theme.spacing.md,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  titleDark: {
    color: 'white',
  },
  iconButton: {
    padding: theme.spacing.xs,
    marginHorizontal: -theme.spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});
