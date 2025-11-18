import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import { supabase } from '@/services/supabase';

/**
 * Question 타입
 */
interface Question {
  id: string;
  question_title?: string;
  question_text: string;
  scheduled_date: string;
  is_published: boolean;
  created_at: string;
  answer_count?: number;
}

/**
 * QuestionsScreen
 *
 * 질문 화면
 * - 오늘의 질문 배너
 * - 이전 질문 리스트 (제목 미리보기)
 * - Supabase 실시간 데이터 연동
 */
export default function QuestionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 데이터 불러오기
  useEffect(() => {
    fetchQuestions();
  }, []);

  /**
   * 질문 목록 가져오기
   */
  const fetchQuestions = async () => {
    try {
      setLoading(true);

      // 발행된 질문만 가져오기 (오늘 이전 날짜)
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('is_published', true)
        .lte('scheduled_date', today)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      // 각 질문의 답변 개수 가져오기
      const questionsWithCount = await Promise.all(
        (data || []).map(async (question) => {
          const { count } = await supabase
            .from('question_answers')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', question.id)
            .eq('is_public', true);

          return {
            ...question,
            answer_count: count || 0,
          };
        })
      );

      setQuestions(questionsWithCount);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('오류', '질문 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 질문 상세로 이동
   */
  const handleQuestionDetail = (id: string) => {
    router.push(`/questions/${id}`);
  };

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  /**
   * 오늘 질문인지 확인
   */
  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const questionDate = new Date(dateString).toISOString().split('T')[0];
    return today === questionDate;
  };

  /**
   * 질문 제목 생성 (제목이 없으면 내용에서 추출)
   */
  const getQuestionTitle = (question: Question) => {
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

  /**
   * 이전 질문 카드 렌더링
   */
  const renderPastQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={[styles.questionCard, isDark && styles.questionCardDark]}
      onPress={() => handleQuestionDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.questionHeader}>
        <View style={styles.questionDate}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.questionDateText, isDark && styles.textSecondaryDark]}>
            {formatDate(item.scheduled_date)}
          </Text>
        </View>
        {item.answer_count !== undefined && item.answer_count > 0 && (
          <View style={styles.answerBadge}>
            <Ionicons name="chatbubble" size={12} color={theme.colors.primary} />
            <Text style={styles.answerBadgeText}>{item.answer_count}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.questionTitle, isDark && styles.textDark]}>
        {getQuestionTitle(item)}
      </Text>

      <View style={styles.questionFooter}>
        <Text style={styles.viewLink}>자세히 보기 →</Text>
      </View>
    </TouchableOpacity>
  );

  // 오늘의 질문과 이전 질문 분리
  const todayQuestion = questions.find((q) => isToday(q.scheduled_date));
  const pastQuestions = questions.filter((q) => !isToday(q.scheduled_date));

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="질문" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            질문을 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={pastQuestions}
          renderItem={renderPastQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchQuestions();
          }}
          ListHeaderComponent={
            todayQuestion ? (
              <View style={styles.header}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleQuestionDetail(todayQuestion.id)}
                >
                  <LinearGradient
                    colors={['#007AFF', '#5856D6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.todayBanner}
                  >
                    <View style={styles.todayHeader}>
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>오늘의 질문</Text>
                      </View>
                      <Text style={styles.todayDate}>
                        {formatDate(todayQuestion.scheduled_date)}
                      </Text>
                    </View>
                    <Text style={styles.todayQuestionTitle}>
                      {getQuestionTitle(todayQuestion)}
                    </Text>
                    <View style={styles.todayFooter}>
                      <View style={styles.todayAnswerCount}>
                        <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                        <Text style={styles.todayAnswerCountText}>
                          {todayQuestion.answer_count || 0}개의 답변
                        </Text>
                      </View>
                      <View style={styles.answerButton}>
                        <Text style={styles.answerButtonText}>자세히 보기 →</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Past Questions Title */}
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                  이전 질문
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && !todayQuestion ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubble-outline"
                  size={64}
                  color={isDark ? '#8E8E93' : '#D1D5DB'}
                />
                <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                  아직 질문이 없습니다
                </Text>
              </View>
            ) : null
          }
        />
      )}
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: 100,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },

  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },

  // Header
  header: {
    marginBottom: theme.spacing.md,
  },

  // Today's Question Banner
  todayBanner: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  todayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  todayBadgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  todayDate: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.fontSize.sm,
  },
  todayQuestionTitle: {
    color: 'white',
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    lineHeight: 28,
  },
  todayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayAnswerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayAnswerCountText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
  },
  answerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  answerButtonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },

  // Section Title
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },

  // Past Question Card
  questionCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  questionCardDark: {
    backgroundColor: '#1C1C1E',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  questionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionDateText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  answerBadgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  questionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // Dark mode text colors
  textDark: {
    color: 'white',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
});
