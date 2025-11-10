import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TopNavBar } from '@/components/navigation';

/**
 * MeetingsScreen
 *
 * 모임 화면 (TODO: 구현 예정)
 */
export default function MeetingsScreen() {
  return (
    <View style={styles.container}>
      <TopNavBar title="모임" />
      <View style={styles.content}>
        <Text style={styles.text}>모임 화면 (구현 예정)</Text>
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
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
