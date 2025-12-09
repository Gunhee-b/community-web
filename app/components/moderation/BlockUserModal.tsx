import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { blockUser } from '@/services/moderation';

interface BlockUserModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  onBlockSuccess?: () => void;
}

export function BlockUserModal({
  visible,
  onClose,
  userId,
  username,
  onBlockSuccess,
}: BlockUserModalProps) {
  const [blocking, setBlocking] = useState(false);

  const handleBlock = async () => {
    setBlocking(true);

    const result = await blockUser({
      blockedUserId: userId,
    });

    setBlocking(false);

    if (result.success) {
      Alert.alert(
        '차단 완료',
        `${username}님을 차단했습니다. 이 사용자의 콘텐츠가 더 이상 표시되지 않습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              onClose();
              onBlockSuccess?.();
            },
          },
        ]
      );
    } else {
      Alert.alert('차단 실패', result.error || '차단 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-remove" size={48} color="#FF3B30" />
          </View>

          <Text style={styles.title}>사용자 차단</Text>
          <Text style={styles.message}>
            <Text style={styles.username}>{username}</Text>님을 차단하시겠습니까?
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>차단하면:</Text>
            <Text style={styles.infoItem}>• 이 사용자의 답변과 댓글이 보이지 않습니다</Text>
            <Text style={styles.infoItem}>• 이 사용자가 만든 모임이 보이지 않습니다</Text>
            <Text style={styles.infoItem}>• 설정에서 언제든지 차단을 해제할 수 있습니다</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={blocking}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.blockButton]}
              onPress={handleBlock}
              disabled={blocking}
            >
              {blocking ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.blockButtonText}>차단하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  username: {
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  blockButton: {
    backgroundColor: '#FF3B30',
  },
  blockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
