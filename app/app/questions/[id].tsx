import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import {
  fetchQuestionById,
  fetchAnswersByQuestion,
  submitAnswer as apiSubmitAnswer
} from '@/services/api/questions';
import { AuthService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import type { Question, Answer } from '@/types';

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

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Answer form state
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);

  // Fetch question and answers on mount
  useEffect(() => {
    fetchQuestionData();
    loadCurrentUser();
  }, [id]);

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Fetch question and answers data
  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch question details
      const { data: questionData, error: questionError } = await fetchQuestionById(id as string);

      if (questionError) {
        throw new Error('질문 정보를 불러올 수 없습니다');
      }

      if (questionData) {
        setQuestion(questionData);
      }

      // Fetch public answers
      const { data: answersData, error: answersError } = await fetchAnswersByQuestion(
        id as string,
        true // publicOnly
      );

      if (answersError) {
        console.error('Error fetching answers:', answersError);
      } else if (answersData) {
        setAnswers(answersData);
      }
    } catch (err: any) {
      console.error('Error fetching question:', err);
      setError(err.message || '질문 정보를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // Image picker
  const handleImageUpload = async () => {
    if (imageUris.length >= 2) {
      Alert.alert('알림', '이미지는 최대 2장까지 업로드할 수 있습니다.');
      return;
    }

    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUris([...imageUris, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  };

  const removeImage = (index: number) => {
    setImageUris(imageUris.filter((_, i) => i !== index));
  };

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (uri: string, index: number): Promise<string | null> => {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Convert base64 to ArrayBuffer
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Generate unique filename
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${index}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('answer-images')
        .upload(filePath, byteArray, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('answer-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (!currentUser) {
      Alert.alert('로그인 필요', '답변을 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (!answer.trim()) {
      Alert.alert('알림', '답변 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images if any
      let imageUrl1 = null;
      let imageUrl2 = null;

      if (imageUris.length > 0) {
        setUploading(true);
        imageUrl1 = await uploadImageToStorage(imageUris[0], 0);

        if (imageUris.length > 1) {
          imageUrl2 = await uploadImageToStorage(imageUris[1], 1);
        }
        setUploading(false);
      }

      if (editingAnswerId) {
        // Update existing answer
        const { error } = await supabase
          .from('question_answers')
          .update({
            content: answer.trim(),
            image_url: imageUrl1 || null,
            image_url_2: imageUrl2 || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAnswerId);

        if (error) throw error;

        Alert.alert('성공', '답변이 수정되었습니다!');
      } else {
        // Submit new answer
        const answerData = {
          question_id: id as string,
          user_id: currentUser.id,
          content: answer.trim(),
          is_public: true,
          image_url: imageUrl1 || undefined,
          image_url_2: imageUrl2 || undefined,
        };

        const { error } = await apiSubmitAnswer(answerData);

        if (error) throw error;

        Alert.alert('성공', '답변이 등록되었습니다!');
      }

      // Reset form
      setShowAnswerForm(false);
      setAnswer('');
      setImageUris([]);
      setEditingAnswerId(null);

      // Refetch answers
      await fetchQuestionData();
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      Alert.alert('오류', err.message || '답변 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  // Edit answer
  const handleEditAnswer = (ans: Answer) => {
    setEditingAnswerId(ans.id);
    setAnswer(ans.content || ans.answer_text || '');
    setImageUris([]); // Images can't be edited for simplicity
    setShowAnswerForm(true);
  };

  // Delete answer
  const handleDeleteAnswer = (answerId: string) => {
    Alert.alert(
      '답변 삭제',
      '정말로 이 답변을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('question_answers')
                .delete()
                .eq('id', answerId);

              if (error) throw error;

              Alert.alert('성공', '답변이 삭제되었습니다.');
              await fetchQuestionData();
            } catch (err: any) {
              console.error('Error deleting answer:', err);
              Alert.alert('오류', '답변 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="질문 상세" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            질문 정보를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error || !question) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="질문 상세" showBackButton />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.errorText, isDark && styles.textDark]}>
            {error || '질문 정보를 찾을 수 없습니다'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchQuestionData}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Format question date
  const questionDate = new Date(question.scheduled_date || question.created_at);
  const dateStr = questionDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });

  // 질문 제목 가져오기
  const getQuestionTitle = () => {
    // 새로운 필드명 우선
    if (question.title) {
      return question.title;
    }
    // Legacy 필드명
    if (question.question_title) {
      return question.question_title;
    }
    // 제목이 없으면 짧은 설명 사용
    if (question.short_description) {
      return question.short_description.length > 50
        ? question.short_description.substring(0, 50) + '...'
        : question.short_description;
    }
    // 그것도 없으면 내용에서 추출
    const contentText = question.content || question.question_text || '';
    if (!contentText) {
      return '질문';
    }
    return contentText.length > 50
      ? contentText.substring(0, 50) + '...'
      : contentText;
  };

  // 질문 상세 내용 가져오기
  const getQuestionContent = () => {
    return question.content || question.question_text || '';
  };

  // 짧은 설명 가져오기
  const getShortDescription = () => {
    return question.short_description || '';
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
              <Text style={styles.questionDateText}>{dateStr}</Text>
            </View>

            {/* 질문 제목 */}
            <Text style={styles.questionTitle}>{getQuestionTitle()}</Text>

            {/* 짧은 설명 (있으면 표시) */}
            {getShortDescription() && (
              <Text style={styles.questionShortDescription}>
                {getShortDescription()}
              </Text>
            )}

            {/* 상세 내용 (있으면 표시) */}
            {getQuestionContent() && (
              <Text style={styles.questionDetailText}>
                {getQuestionContent()}
              </Text>
            )}

            <View style={styles.questionAnswerCount}>
              <Ionicons name="chatbubble-outline" size={18} color="white" />
              <Text style={styles.questionAnswerCountText}>
                {answers.length}개의 답변
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Answers List */}
        <View style={styles.answersSection}>
          <Text style={[styles.answersTitle, isDark && styles.answersTitleDark]}>
            모든 답변
          </Text>
          {answers.length > 0 ? (
            answers.map((ans) => {
              const answerDate = new Date(ans.created_at);
              const timeStr = answerDate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });
              const username = ans.user?.username || ans.users?.username || '익명';
              const answerContent = ans.content || ans.answer_text || '';
              const isLongAnswer = answerContent.length > 200;
              const truncatedContent = isLongAnswer
                ? answerContent.substring(0, 200) + '...'
                : answerContent;

              const isOwner = currentUser && ans.user_id === currentUser.id;

              return (
                <View key={ans.id} style={[styles.answerCard, isDark && styles.answerCardDark]}>
                  <TouchableOpacity
                    onPress={() => router.push(`/answers/${ans.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.answerHeader}>
                      <LinearGradient
                        colors={['#007AFF', '#5856D6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.answerAvatar}
                      >
                        <Text style={styles.answerAvatarText}>{username[0]}</Text>
                      </LinearGradient>
                      <View style={styles.answerHeaderRight}>
                        <View style={styles.answerHeaderTop}>
                          <Text style={[styles.answerUser, isDark && styles.answerUserDark]}>
                            {username}
                          </Text>
                          <Text style={[styles.answerTime, isDark && styles.answerTimeDark]}>
                            {timeStr}
                          </Text>
                        </View>
                        {answerContent && (
                          <Text style={[styles.answerText, isDark && styles.answerTextDark]}>
                            {truncatedContent}
                          </Text>
                        )}
                        {isLongAnswer && (
                          <Text style={styles.readMoreText}>자세히 보기 →</Text>
                        )}
                      </View>
                    </View>
                    {(ans.image_url || ans.image_url_2) && (
                      <View style={styles.answerImages}>
                        {ans.image_url && (
                          <Image
                            source={{ uri: ans.image_url }}
                            style={styles.answerImage}
                            resizeMode="cover"
                          />
                        )}
                        {ans.image_url_2 && (
                          <Image
                            source={{ uri: ans.image_url_2 }}
                            style={styles.answerImage}
                            resizeMode="cover"
                          />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Edit/Delete buttons for owner */}
                  {isOwner && (
                    <View style={styles.answerActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditAnswer(ans)}
                      >
                        <Ionicons name="create-outline" size={16} color="#007AFF" />
                        <Text style={styles.editButtonText}>수정</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteAnswer(ans.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        <Text style={styles.deleteButtonText}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
              <Ionicons
                name="chatbubble-outline"
                size={48}
                color={isDark ? '#636366' : '#9CA3AF'}
              />
              <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                아직 답변이 없습니다
              </Text>
            </View>
          )}
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
                {editingAnswerId ? '답변 수정' : '답변 작성'}
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
                  {imageUris.length}/2
                </Text>
              </View>
              <View style={styles.imageUploadList}>
                {imageUris.map((uri, idx) => (
                  <View key={idx} style={styles.imageUploadItem}>
                    <Image
                      source={{ uri }}
                      style={styles.imageUploadPreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.imageRemoveButton}
                      onPress={() => removeImage(idx)}
                      disabled={uploading || submitting}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                {imageUris.length < 2 && (
                  <TouchableOpacity
                    style={[
                      styles.imageUploadButton,
                      isDark && styles.imageUploadButtonDark,
                      (uploading || submitting) && styles.buttonDisabled,
                    ]}
                    onPress={handleImageUpload}
                    disabled={uploading || submitting}
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={isDark ? '#636366' : '#9CA3AF'}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmitAnswer}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>답변 제출</Text>
              )}
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

  // Loading State
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

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  textDark: {
    color: 'white',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },

  // Empty State
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  emptyCardDark: {
    backgroundColor: '#1C1C1E',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: '#9CA3AF',
  },

  // Button Disabled State
  buttonDisabled: {
    opacity: 0.6,
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
  questionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    lineHeight: 30,
  },
  questionShortDescription: {
    fontSize: 16,
    color: 'white',
    opacity: 0.95,
    marginBottom: 12,
    lineHeight: 22,
  },
  questionDetailText: {
    fontSize: 15,
    color: 'white',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 22,
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
  readMoreText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 8,
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

  // Answer Actions (Edit/Delete)
  answerActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#EBF5FF',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
});
