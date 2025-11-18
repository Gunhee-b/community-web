import { supabase } from '../supabase';
import { Question, Answer } from '../../types';

/**
 * Fetch all questions
 */
export const fetchQuestions = async (activeOnly: boolean = false) => {
  try {
    let query = supabase
      .from('daily_questions')
      .select('*')
      .order('scheduled_date', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as Question[], error: null };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return { data: null, error };
  }
};

/**
 * Fetch today's question
 */
export const fetchTodayQuestion = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('is_published', true)
      .eq('scheduled_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { data: data as Question | null, error: null };
  } catch (error) {
    console.error('Error fetching today question:', error);
    return { data: null, error };
  }
};

/**
 * Fetch question by ID
 */
export const fetchQuestionById = async (questionId: string) => {
  try {
    const { data, error } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return { data: data as Question, error: null };
  } catch (error) {
    console.error('Error fetching question:', error);
    return { data: null, error };
  }
};

/**
 * Fetch answers for a question
 */
export const fetchAnswersByQuestion = async (questionId: string, publicOnly: boolean = true) => {
  try {
    let query = supabase
      .from('question_answers')
      .select(`
        *,
        user:users!question_answers_user_id_fkey(username)
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false });

    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as Answer[], error: null };
  } catch (error) {
    console.error('Error fetching answers:', error);
    return { data: null, error };
  }
};

/**
 * Fetch user's answer for a question
 */
export const fetchUserAnswer = async (questionId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('question_answers')
      .select('*')
      .eq('question_id', questionId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
    return { data: data as Answer | null, error: null };
  } catch (error) {
    console.error('Error fetching user answer:', error);
    return { data: null, error };
  }
};

/**
 * Submit an answer
 */
export const submitAnswer = async (answerData: {
  question_id: string;
  user_id: string;
  content: string;       // Use 'content' field (web DB field name)
  is_public: boolean;
  image_url?: string;
  image_url_2?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('question_answers')
      .insert([answerData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error submitting answer:', error);
    return { data: null, error };
  }
};

/**
 * Update an answer
 */
export const updateAnswer = async (
  answerId: string,
  updates: {
    content?: string;      // Use 'content' field (web DB field name)
    is_public?: boolean;
    image_url?: string;
    image_url_2?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('question_answers')
      .update(updates)
      .eq('id', answerId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating answer:', error);
    return { data: null, error };
  }
};

/**
 * Delete an answer
 */
export const deleteAnswer = async (answerId: string) => {
  try {
    const { error } = await supabase.from('question_answers').delete().eq('id', answerId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting answer:', error);
    return { error };
  }
};

/**
 * Create a new question (admin only)
 */
export const createQuestion = async (questionData: {
  question_text: string;
  date: string;
  is_active: boolean;
}) => {
  try {
    const { data, error } = await supabase
      .from('daily_questions')
      .insert([questionData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating question:', error);
    return { data: null, error };
  }
};

/**
 * Update a question (admin only)
 */
export const updateQuestion = async (
  questionId: string,
  updates: {
    question_text?: string;
    is_active?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('daily_questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating question:', error);
    return { data: null, error };
  }
};
