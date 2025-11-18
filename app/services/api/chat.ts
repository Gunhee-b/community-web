import { supabase } from '../supabase';
import { ChatMessage } from '../../types';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Fetch chat messages for a meeting
 */
export const fetchMeetingChats = async (meetingId: string) => {
  try {
    const { data, error } = await supabase
      .from('meeting_chats')
      .select('*, user:users!user_id(username)')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: data as ChatMessage[], error: null };
  } catch (error) {
    console.error('Error fetching chats:', error);
    return { data: null, error };
  }
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (messageData: {
  meeting_id: string;
  user_id: string;
  message: string;
  image_url?: string;
  anonymous_name?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('meeting_chats')
      .insert([messageData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

/**
 * Subscribe to real-time chat updates
 */
export const subscribeToChatMessages = (
  meetingId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`meeting-${meetingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'meeting_chats',
        filter: `meeting_id=eq.${meetingId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Update typing indicator
 */
export const updateTypingIndicator = async (
  meetingId: string,
  userId: string,
  username: string
) => {
  try {
    const { error } = await supabase.from('meeting_typing_indicators').upsert(
      {
        meeting_id: meetingId,
        user_id: userId,
        username: username,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'meeting_id,user_id',
      }
    );

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating typing indicator:', error);
    return { error };
  }
};

/**
 * Remove typing indicator
 */
export const removeTypingIndicator = async (meetingId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('meeting_typing_indicators')
      .delete()
      .eq('meeting_id', meetingId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing typing indicator:', error);
    return { error };
  }
};

/**
 * Fetch typing indicators
 */
export const fetchTypingIndicators = async (meetingId: string, currentUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('meeting_typing_indicators')
      .select('user_id, username')
      .eq('meeting_id', meetingId)
      .neq('user_id', currentUserId)
      .gte('updated_at', new Date(Date.now() - 10000).toISOString());

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching typing indicators:', error);
    return { data: [], error };
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (meetingId: string, userId: string) => {
  try {
    const { error } = await supabase.rpc('mark_meeting_chats_as_read', {
      p_meeting_id: meetingId,
      p_user_id: userId,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { error };
  }
};

/**
 * Fetch read receipts
 */
export const fetchReadReceipts = async (chatIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from('meeting_chat_read_receipts')
      .select('chat_id, user_id')
      .in('chat_id', chatIds);

    if (error) throw error;

    // Group by chat_id
    const receiptsMap: Record<string, string[]> = {};
    data?.forEach((receipt) => {
      if (!receiptsMap[receipt.chat_id]) {
        receiptsMap[receipt.chat_id] = [];
      }
      receiptsMap[receipt.chat_id].push(receipt.user_id);
    });

    return { data: receiptsMap, error: null };
  } catch (error) {
    console.error('Error fetching read receipts:', error);
    return { data: {}, error };
  }
};

/**
 * Upload chat image
 */
export const uploadChatImage = async (meetingId: string, fileUri: string, fileName: string) => {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    // Convert base64 to ArrayBuffer
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const fileExt = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `chat-images/${meetingId}/${uniqueFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('meeting-images')
      .upload(filePath, byteArray, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('meeting-images').getPublicUrl(filePath);

    return { data: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading chat image:', error);
    return { data: null, error };
  }
};
