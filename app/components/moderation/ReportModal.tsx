import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  reportContent,
  REPORT_REASONS,
  ReportReason,
  ContentType,
} from '@/services/moderation';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
  reportedUserId: string;
  onReportSuccess?: () => void;
}

export function ReportModal({
  visible,
  onClose,
  contentType,
  contentId,
  reportedUserId,
  onReportSuccess,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('신고 사유 선택', '신고 사유를 선택해 주세요.');
      return;
    }

    setSubmitting(true);

    const result = await reportContent({
      contentType,
      contentId,
      reportedUserId,
      reason: selectedReason,
      description: description.trim() || undefined,
    });

    setSubmitting(false);

    if (result.success) {
      Alert.alert(
        '신고 완료',
        '신고가 접수되었습니다. 24시간 내에 검토하여 조치하겠습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              setSelectedReason(null);
              setDescription('');
              onClose();
              onReportSuccess?.();
            },
          },
        ]
      );
    } else {
      Alert.alert('신고 실패', result.error || '신고 처리 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>콘텐츠 신고</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>신고 사유를 선택해 주세요</Text>

            {(Object.keys(REPORT_REASONS) as ReportReason[]).map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={styles.radioButton}>
                  {selectedReason === reason && <View style={styles.radioButtonInner} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}
                >
                  {REPORT_REASONS[reason]}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionTitle, styles.descriptionTitle]}>
              상세 설명 (선택사항)
            </Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="신고 내용에 대해 자세히 설명해 주세요"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, !selectedReason && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!selectedReason || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>신고하기</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.warningText}>
              허위 신고는 제재 대상이 될 수 있습니다. 신고 내용은 24시간 내에 검토됩니다.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionTitle: {
    marginTop: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  reasonOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  reasonText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});
