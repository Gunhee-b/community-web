import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';

/**
 * QuestionDetailScreen
 *
 * 질문 상세 화면
 * - 질문 카드 (날짜, 질문 내용, 답변 개수)
 * - 답변 목록
 * - 답변 작성 폼 (모달)
 * - 이미지 업로드 (최대 2장)
 */
export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // TODO: Replace with API call
  const question = {
    id: Number(id),
    question: '오늘 가장 기억에 남는 순간은 무엇인가요?',
    date: '11월 8일',
    answerCount: 24,
  };

  // TODO: Replace with API call
  const answers = [
    {
      id: 1,
      user: '김민수',
      avatar: '김',
      answer: '오늘 아침에 본 일출이 정말 아름다웠어요. 맑은 하늘과 함께 시작하는 하루가 기분 좋았습니다.',
      time: '오전 8:30',
      images: [],
    },
    {
      id: 2,
      user: '이지은',
      avatar: '이',
      answer: '친구와 오랜만에 만나서 이야기 나눈 시간이 가장 기억에 남아요. 서로의 근황을 공유하며 즐거운 시간을 보냈습니다.',
      time: '오전 10:15',
      images: [],
    },
    {
      id: 3,
      user: '박준영',
      avatar: '박',
      answer: '업무 프로젝트를 성공적으로 마무리한 순간! 팀원들과 함께 고생한 보람이 있었어요.',
      time: '오후 2:45',
      images: [],
    },
    {
      id: 4,
      user: '최수진',
      avatar: '최',
      answer: '저녁에 본 노을이 정말 환상적이었어요. 하늘이 분홍빛과 주황빛으로 물들어서 사진도 찍었답니다.',
      time: '오후 6:20',
      images: ['sunset1', 'sunset2'],
    },
  ];

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      // TODO: API call to submit answer
      console.log('Submit answer:', answer, images);
      setShowAnswerForm(false);
      setAnswer('');
      setImages([]);
    }
  };

  const handleImageUpload = () => {
    if (images.length < 2) {
      // TODO: Implement image picker
      setImages([...images, 'new-image']);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="질문 상세" showBackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <View style={styles.questionSection}>
          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.questionCard}
          >
            <View style={styles.questionDate}>
              <Ionicons name="calendar-outline" size={16} color="white" />
              <Text style={styles.questionDateText}>{question.date}</Text>
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.questionAnswerCount}>
              <Ionicons name="chatbubble-outline" size={18} color="white" />
              <Text style={styles.questionAnswerCountText}>
                {question.answerCount}개의 답변
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Answers List */}
        <View style={styles.answersSection}>
          <Text style={[styles.answersTitle, isDark && styles.answersTitleDark]}>
            모든 답변
          </Text>
          {answers.map((ans) => (
            <View
              key={ans.id}
              style={[styles.answerCard, isDark && styles.answerCardDark]}
            >
              <View style={styles.answerHeader}>
                <LinearGradient
                  colors={['#007AFF', '#5856D6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.answerAvatar}
                >
                  <Text style={styles.answerAvatarText}>{ans.avatar}</Text>
                </LinearGradient>
                <View style={styles.answerHeaderRight}>
                  <View style={styles.answerHeaderTop}>
                    <Text style={[styles.answerUser, isDark && styles.answerUserDark]}>
                      {ans.user}
                    </Text>
                    <Text style={[styles.answerTime, isDark && styles.answerTimeDark]}>
                      {ans.time}
                    </Text>
                  </View>
                  <Text style={[styles.answerText, isDark && styles.answerTextDark]}>
                    {ans.answer}
                  </Text>
                </View>
              </View>
              {ans.images.length > 0 && (
                <View style={styles.answerImages}>
                  {ans.images.map((img, idx) => (
                    <LinearGradient
                      key={idx}
                      colors={['#FB923C', '#EC4899']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.answerImage}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, isDark && styles.bottomBarDark]}>
        <TouchableOpacity
          style={styles.answerButton}
          onPress={() => setShowAnswerForm(true)}
        >
          <Text style={styles.answerButtonText}>답변 작성하기</Text>
        </TouchableOpacity>
      </View>

      {/* Answer Form Modal */}
      <Modal
        visible={showAnswerForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnswerForm(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAnswerForm(false)}
          />
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                답변 작성
              </Text>
              <TouchableOpacity onPress={() => setShowAnswerForm(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
              </TouchableOpacity>
            </View>

            {/* Answer Input */}
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="당신의 답변을 공유해주세요..."
              placeholderTextColor={isDark ? '#636366' : '#9CA3AF'}
              multiline
              numberOfLines={6}
              style={[styles.answerInput, isDark && styles.answerInputDark]}
              textAlignVertical="top"
            />

            {/* Image Upload */}
            <View style={styles.imageUploadSection}>
              <View style={styles.imageUploadHeader}>
                <Text style={[styles.imageUploadLabel, isDark && styles.imageUploadLabelDark]}>
                  이미지 (최대 2장)
                </Text>
                <Text style={[styles.imageUploadCount, isDark && styles.imageUploadCountDark]}>
                  {images.length}/2
                </Text>
              </View>
              <View style={styles.imageUploadList}>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.imageUploadItem}>
                    <LinearGradient
                      colors={['#60A5FA', '#A78BFA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.imageUploadPreview}
                    />
                    <TouchableOpacity
                      style={styles.imageRemoveButton}
                      onPress={() => removeImage(idx)}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 2 && (
                  <TouchableOpacity
                    style={[styles.imageUploadButton, isDark && styles.imageUploadButtonDark]}
                    onPress={handleImageUpload}
                  >
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={isDark ? '#636366' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitAnswer}
            >
              <Text style={styles.submitButtonText}>답변 제출</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  scrollContent: {
    paddingBottom: 100,
  },

  // Question Section
  questionSection: {
    padding: theme.spacing.md,
  },
  questionCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  questionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  questionDateText: {
    fontSize: theme.fontSize.sm,
    color: 'white',
    opacity: 0.9,
  },
  questionText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 16,
    lineHeight: 28,
  },
  questionAnswerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionAnswerCountText: {
    fontSize: theme.fontSize.sm,
    color: 'white',
  },

  // Answers Section
  answersSection: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  answersTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: theme.spacing.xs,
  },
  answersTitleDark: {
    color: 'white',
  },
  answerCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  answerCardDark: {
    backgroundColor: '#1C1C1E',
  },
  answerHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  answerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  answerHeaderRight: {
    flex: 1,
  },
  answerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  answerUser: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: '#1F2937',
  },
  answerUserDark: {
    color: 'white',
  },
  answerTime: {
    fontSize: theme.fontSize.xs,
    color: '#9CA3AF',
  },
  answerTimeDark: {
    color: '#636366',
  },
  answerText: {
    fontSize: theme.fontSize.sm,
    color: '#4B5563',
    lineHeight: 20,
  },
  answerTextDark: {
    color: '#D1D5DB',
  },
  answerImages: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  answerImage: {
    width: 128,
    height: 128,
    borderRadius: theme.borderRadius.lg,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: theme.spacing.md,
  },
  bottomBarDark: {
    backgroundColor: '#1C1C1E',
    borderTopColor: '#2C2C2E',
  },
  answerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  answerButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: 'white',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalContentDark: {
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalTitleDark: {
    color: 'white',
  },

  // Answer Input
  answerInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: '#1F2937',
    minHeight: 150,
  },
  answerInputDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#3A3A3C',
    color: 'white',
  },

  // Image Upload
  imageUploadSection: {
    gap: 8,
  },
  imageUploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageUploadLabel: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  imageUploadLabelDark: {
    color: '#8E8E93',
  },
  imageUploadCount: {
    fontSize: theme.fontSize.xs,
    color: '#9CA3AF',
  },
  imageUploadCountDark: {
    color: '#636366',
  },
  imageUploadList: {
    flexDirection: 'row',
    gap: 8,
  },
  imageUploadItem: {
    position: 'relative',
  },
  imageUploadPreview: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadButton: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadButtonDark: {
    borderColor: '#3A3A3C',
    backgroundColor: '#2C2C2E',
  },

  // Submit Button
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: 'white',
  },
});
