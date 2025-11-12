import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';

/**
 * QuestionsScreen
 *
 * 질문 화면
 * - 오늘의 질문 배너
 * - 이전 질문 리스트
 */
export default function QuestionsScreen() {
  const router = useRouter();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // Mock data - TODO: Replace with API calls
  const questions = [
    {
      id: 1,
      question: '오늘 가장 기억에 남는 순간은 무엇인가요?',
      answerCount: 24,
      date: '11월 8일',
      isToday: true,
    },
    {
      id: 2,
      question: '최근에 읽은 책 중 가장 추천하고 싶은 책은?',
      answerCount: 18,
      date: '11월 7일',
      isToday: false,
    },
    {
      id: 3,
      question: '주말에 가장 하고 싶은 활동은 무엇인가요?',
      answerCount: 32,
      date: '11월 6일',
      isToday: false,
    },
    {
      id: 4,
      question: '가장 좋아하는 음식과 그 이유는?',
      answerCount: 27,
      date: '11월 5일',
      isToday: false,
    },
    {
      id: 5,
      question: '만약 시간 여행을 할 수 있다면 언제로 가고 싶나요?',
      answerCount: 21,
      date: '11월 4일',
      isToday: false,
    },
    {
      id: 6,
      question: '최근에 배운 것 중 가장 유용한 것은?',
      answerCount: 15,
      date: '11월 3일',
      isToday: false,
    },
    {
      id: 7,
      question: '당신의 버킷리스트 1순위는 무엇인가요?',
      answerCount: 29,
      date: '11월 2일',
      isToday: false,
    },
    {
      id: 8,
      question: '스트레스를 해소하는 나만의 방법은?',
      answerCount: 23,
      date: '11월 1일',
      isToday: false,
    },
  ];

  const todayQuestion = questions.find((q) => q.isToday);
  const pastQuestions = questions.filter((q) => !q.isToday);

  const handleQuestionDetail = (id: number) => {
    router.push(`/questions/${id}`);
  };

  const renderPastQuestion = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.questionCard, isDark && styles.questionCardDark]}
      onPress={() => handleQuestionDetail(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.questionDate}>
        <Ionicons
          name="calendar-outline"
          size={14}
          color={isDark ? '#8E8E93' : '#6B7280'}
        />
        <Text style={[styles.questionDateText, isDark && styles.textSecondaryDark]}>
          {item.date}
        </Text>
      </View>
      <Text style={[styles.questionText, isDark && styles.textDark]}>
        {item.question}
      </Text>
      <View style={styles.questionFooter}>
        <View style={styles.answerCount}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={16}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.answerCountText, isDark && styles.textSecondaryDark]}>
            {item.answerCount}개의 답변
          </Text>
        </View>
        <Text style={styles.viewLink}>답변 보기</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="질문" />
      <FlatList
        data={pastQuestions}
        renderItem={renderPastQuestion}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
                    <Text style={styles.todayDate}>{todayQuestion.date}</Text>
                  </View>
                  <Text style={styles.todayQuestion}>{todayQuestion.question}</Text>
                  <View style={styles.todayFooter}>
                    <View style={styles.todayAnswerCount}>
                      <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                      <Text style={styles.todayAnswerCountText}>
                        {todayQuestion.answerCount}개의 답변
                      </Text>
                    </View>
                    <View style={styles.answerButton}>
                      <Text style={styles.answerButtonText}>답변하기 →</Text>
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
      />
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
    gap: 8,
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
  todayQuestion: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
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
  questionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  questionDateText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  questionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerCountText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
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
