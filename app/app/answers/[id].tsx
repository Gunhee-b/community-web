import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopNavBar } from '@/components/navigation';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import type { Answer, AnswerComment } from '@/types';

/**
 * AnswerDetailScreen
 *
 * 답변 상세 화면
 * - 답변 내용 표시
 * - 댓글 목록 표시
 * - 댓글 작성
 * - 댓글 삭제
 */
export default function AnswerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const [answer, setAnswer] = useState<Answer | null>(null);
  const [comments, setComments] = useState<AnswerComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnswerDetail();
    fetchComments();
  }, [id]);

  /**
   * 답변 상세 정보 가져오기
   */
  const fetchAnswerDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('question_answers')
        .select(`
          *,
          user:users!question_answers_user_id_fkey(username)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setAnswer(data);
    } catch (error) {
      console.error('Error fetching answer:', error);
      Alert.alert('오류', '답변을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 댓글 목록 가져오기
   */
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('answer_comments')
        .select(`
          *,
          user:users!answer_comments_user_id_fkey(username)
        `)
        .eq('answer_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  /**
   * 댓글 작성
   */
  const handleSubmitComment = async () => {
    if (!user) {
      Alert.alert('로그인 필요', '댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('입력 오류', '댓글 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('answer_comments')
        .insert([
          {
            answer_id: id,
            user_id: user.id,
            content: commentText.trim(),
          },
        ]);

      if (error) throw error;

      setCommentText('');
      Alert.alert('성공', '댓글이 작성되었습니다.');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 댓글 삭제
   */
  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      '댓글 삭제',
      '이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('answer_comments')
                .delete()
                .eq('id', commentId);

              if (error) throw error;

              Alert.alert('성공', '댓글이 삭제되었습니다.');
              fetchComments();
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="답변 상세" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            답변을 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  if (!answer) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="답변 상세" showBackButton />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={isDark ? '#8E8E93' : '#D1D5DB'}
          />
          <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
            답변을 찾을 수 없습니다
          </Text>
        </View>
      </View>
    );
  }

  const username = answer.user?.username || answer.users?.username || '익명';
  const answerContent = answer.content || answer.answer_text || '';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="답변 상세" showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Answer Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* Author Info */}
          <View style={[styles.authorSection, isDark && styles.authorSectionDark]}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{username[0]}</Text>
            </LinearGradient>
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, isDark && styles.textDark]}>
                {username}
              </Text>
              <Text style={[styles.date, isDark && styles.textSecondaryDark]}>
                {formatDate(answer.created_at)}
              </Text>
            </View>
          </View>

          {/* Answer Content */}
          <Text style={[styles.answerContent, isDark && styles.textDark]}>
            {answerContent}
          </Text>

          {/* Images */}
          {(answer.image_url || answer.image_url_2) && (
            <View style={styles.imagesContainer}>
              {answer.image_url && (
                <Image
                  source={{ uri: answer.image_url }}
                  style={styles.answerImage}
                  resizeMode="cover"
                />
              )}
              {answer.image_url_2 && (
                <Image
                  source={{ uri: answer.image_url_2 }}
                  style={styles.answerImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.commentsHeader}>
            <Ionicons
              name="chatbox-outline"
              size={20}
              color={isDark ? 'white' : theme.colors.text.primary}
            />
            <Text style={[styles.commentsTitle, isDark && styles.textDark]}>
              댓글 {comments.length}개
            </Text>
          </View>

          {/* Comments List */}
          {comments.length > 0 ? (
            <View style={styles.commentsList}>
              {comments.map((comment) => {
                const commentUsername = comment.user?.username || '익명';
                const isOwner = user && comment.user_id === user.id;

                return (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthor}>
                        <LinearGradient
                          colors={['#5AC8FA', '#007AFF']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.commentAvatar}
                        >
                          <Text style={styles.commentAvatarText}>
                            {commentUsername[0]}
                          </Text>
                        </LinearGradient>
                        <View>
                          <Text style={[styles.commentUsername, isDark && styles.textDark]}>
                            {commentUsername}
                          </Text>
                          <Text style={[styles.commentDate, isDark && styles.textSecondaryDark]}>
                            {formatDate(comment.created_at)}
                          </Text>
                        </View>
                      </View>
                      {isOwner && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.commentContent, isDark && styles.textDark]}>
                      {comment.content}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyComments}>
              <Text style={[styles.emptyCommentsText, isDark && styles.textSecondaryDark]}>
                아직 댓글이 없습니다
              </Text>
            </View>
          )}

          {/* Comment Input */}
          {user && (
            <View style={[styles.commentInputContainer, isDark && styles.commentInputContainerDark]}>
              <TextInput
                style={[styles.commentInput, isDark && styles.commentInputDark]}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="댓글을 입력하세요..."
                placeholderTextColor={isDark ? '#636366' : '#9CA3AF'}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!commentText.trim() || submitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },

  // Author Section
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  authorSectionDark: {
    borderBottomColor: '#38383A',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
  },

  // Answer Content
  answerContent: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },

  // Images
  imagesContainer: {
    gap: theme.spacing.sm,
  },
  answerImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
  },

  // Comments Section
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderTopWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  commentsHeaderDark: {
    borderBottomColor: '#38383A',
  },
  commentsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },

  // Comments List
  commentsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  commentItem: {
    gap: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  commentUsername: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  commentDate: {
    fontSize: theme.fontSize.xs,
    color: '#8E8E93',
  },
  commentContent: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    lineHeight: 20,
    paddingLeft: 44,
  },

  // Empty Comments
  emptyComments: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: theme.fontSize.sm,
    color: '#8E8E93',
  },

  // Comment Input
  commentInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  commentInputContainerDark: {
    borderTopColor: '#38383A',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
    maxHeight: 100,
  },
  commentInputDark: {
    backgroundColor: '#2C2C2E',
    color: 'white',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8E8E93',
  },

  // Text Colors
  textDark: {
    color: 'white',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
});
