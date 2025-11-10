import { supabase } from '../supabase';
import { Meeting } from '../../types';

export interface MeetingFilters {
  type?: 'regular' | 'casual' | 'past';
  status?: string[];
}

/**
 * Fetch meetings with optional filters
 */
export const fetchMeetings = async (filters: MeetingFilters = {}) => {
  try {
    let query = supabase
      .from('offline_meetings')
      .select(`
        *,
        host:users!host_id(username),
        participants:meeting_participants(count)
      `)
      .eq('is_template', false);

    if (filters.type === 'regular') {
      query = query
        .eq('meeting_type', 'regular')
        .gte('start_datetime', new Date().toISOString())
        .in('status', filters.status || ['recruiting', 'confirmed']);
    } else if (filters.type === 'casual') {
      query = query
        .eq('meeting_type', 'casual')
        .gte('start_datetime', new Date().toISOString())
        .in('status', filters.status || ['recruiting', 'confirmed']);
    } else if (filters.type === 'past') {
      query = query.lt('start_datetime', new Date().toISOString());
    }

    const { data, error } = await query.order('start_datetime', {
      ascending: filters.type !== 'past',
    });

    if (error) throw error;
    return { data: data as Meeting[], error: null };
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return { data: null, error };
  }
};

/**
 * Fetch meeting by ID
 */
export const fetchMeetingById = async (meetingId: string) => {
  try {
    const { data, error } = await supabase
      .from('offline_meetings')
      .select(`
        *,
        host:users!host_id(username),
        participants:meeting_participants(
          *,
          user:users(username)
        )
      `)
      .eq('id', meetingId)
      .single();

    if (error) throw error;
    return { data: data as Meeting, error: null };
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return { data: null, error };
  }
};

/**
 * Create a new meeting
 */
export const createMeeting = async (meetingData: Partial<Meeting>) => {
  try {
    const { data, error } = await supabase
      .from('offline_meetings')
      .insert([meetingData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating meeting:', error);
    return { data: null, error };
  }
};

/**
 * Update meeting
 */
export const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
  try {
    const { data, error } = await supabase
      .from('offline_meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating meeting:', error);
    return { data: null, error };
  }
};

/**
 * Delete meeting
 */
export const deleteMeeting = async (meetingId: string) => {
  try {
    const { error } = await supabase
      .from('offline_meetings')
      .delete()
      .eq('id', meetingId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return { error };
  }
};

/**
 * Join a meeting
 */
export const joinMeeting = async (meetingId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('meeting_participants')
      .insert([
        {
          meeting_id: meetingId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error joining meeting:', error);
    return { data: null, error };
  }
};

/**
 * Leave a meeting
 */
export const leaveMeeting = async (meetingId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('meeting_participants')
      .delete()
      .eq('meeting_id', meetingId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error leaving meeting:', error);
    return { error };
  }
};

/**
 * Confirm meeting (admin only)
 */
export const confirmMeeting = async (meetingId: string) => {
  try {
    const { data, error } = await supabase.rpc('confirm_meeting', {
      p_meeting_id: meetingId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error confirming meeting:', error);
    return { data: null, error };
  }
};
