/**
 * Web Dashboard Type Definitions
 * Aligned with Supabase Database Schema (2025-12-11)
 *
 * Note: These are JSDoc types for JavaScript projects.
 * Database uses snake_case, frontend uses camelCase for state.
 */

// ============================================
// ENUM Types
// ============================================

/**
 * @typedef {'ADMIN' | 'USER'} UserRole
 */

/**
 * @typedef {'recruiting' | 'closed' | 'confirmed'} MeetingStatus
 */

/**
 * @typedef {'coffee' | 'alcohol'} MeetingPurpose
 */

/**
 * @typedef {'regular' | 'special'} MeetingType
 */

/**
 * @typedef {'local' | 'google' | 'kakao' | 'apple'} AuthProvider
 */

// ============================================
// Database Table Types (snake_case - as returned by Supabase)
// ============================================

/**
 * Profile from profiles table (snake_case)
 * @typedef {Object} DbProfile
 * @property {string} id - UUID primary key
 * @property {string} username - Unique username
 * @property {string|null} full_name - Display name
 * @property {string|null} avatar_url - Profile image URL
 * @property {UserRole} role - 'ADMIN' or 'USER'
 * @property {boolean} is_active - Active status
 * @property {string} updated_at - Last updated timestamp
 * @property {string|null} kakao_nickname - Kakao display name
 * @property {number} nickname_change_count - Username change count
 * @property {string|null} last_nickname_change - Last nickname change timestamp
 */

/**
 * Meeting from meetings table (snake_case)
 * @typedef {Object} DbMeeting
 * @property {string} id - UUID primary key
 * @property {string} host_id - Host profile ID (references profiles.id)
 * @property {string|null} title - Meeting title
 * @property {string|null} description - Meeting description
 * @property {string} location - Meeting location
 * @property {string|null} location_detail - Detailed location
 * @property {string} meeting_datetime - Meeting date and time (ISO string)
 * @property {number} max_participants - Maximum participants (default 4)
 * @property {number} current_participants - Current participant count
 * @property {MeetingPurpose|null} purpose - 'coffee' or 'alcohol'
 * @property {MeetingStatus} status - 'recruiting', 'closed', or 'confirmed'
 * @property {string|null} image_url - Meeting image URL
 * @property {string|null} kakao_openchat_link - Kakao open chat link
 * @property {MeetingType} type - 'regular' or 'special'
 * @property {string} created_at - Creation timestamp
 * @property {{username: string}|null} host - Joined host profile data
 */

/**
 * Meeting Participant from meeting_participants table
 * @typedef {Object} DbMeetingParticipant
 * @property {string} id - UUID primary key
 * @property {string} meeting_id - Meeting ID
 * @property {string} user_id - Profile ID (references profiles.id)
 * @property {string} joined_at - Join timestamp
 */

/**
 * Post from posts table (SNS feed)
 * @typedef {Object} DbPost
 * @property {string} id - UUID primary key
 * @property {string} author_id - Author profile ID (references profiles.id)
 * @property {string|null} content - Post content
 * @property {string[]|null} image_urls - Array of image URLs
 * @property {number} likes_count - Number of likes
 * @property {number} comments_count - Number of comments
 * @property {string} created_at - Creation timestamp
 * @property {string|null} updated_at - Last update timestamp
 */

// ============================================
// Frontend State Types (camelCase - for React state)
// ============================================

/**
 * User state for frontend (camelCase)
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string|null} fullName - Mapped from full_name
 * @property {string|null} avatarUrl - Mapped from avatar_url
 * @property {UserRole} role
 * @property {boolean} isActive - Mapped from is_active
 * @property {string|null} email
 */

/**
 * Meeting state for frontend (camelCase)
 * @typedef {Object} Meeting
 * @property {string} id
 * @property {string} hostId - Mapped from host_id
 * @property {string|null} title
 * @property {string|null} description
 * @property {string} location
 * @property {string|null} locationDetail - Mapped from location_detail
 * @property {string} meetingDatetime - Mapped from meeting_datetime
 * @property {number} maxParticipants - Mapped from max_participants
 * @property {number} currentParticipants - Mapped from current_participants
 * @property {MeetingPurpose|null} purpose
 * @property {MeetingStatus} status
 * @property {string|null} imageUrl - Mapped from image_url
 * @property {string|null} kakaoOpenchatLink - Mapped from kakao_openchat_link
 * @property {string} createdAt - Mapped from created_at
 * @property {{username: string}|null} host
 */

// ============================================
// Helper Functions for Type Mapping
// ============================================

/**
 * Map DB profile (snake_case) to frontend user state (camelCase)
 * @param {DbProfile} dbProfile - Database profile object
 * @returns {User} - Frontend user object
 */
export function mapDbProfileToUser(dbProfile) {
  if (!dbProfile) return null

  return {
    id: dbProfile.id,
    username: dbProfile.username,
    fullName: dbProfile.full_name,
    avatarUrl: dbProfile.avatar_url,
    role: dbProfile.role || 'USER',
    isActive: dbProfile.is_active ?? true,
    email: dbProfile.email || null,
  }
}

/**
 * Map DB meeting (snake_case) to frontend meeting state (camelCase)
 * @param {DbMeeting} dbMeeting - Database meeting object
 * @returns {Meeting} - Frontend meeting object
 */
export function mapDbMeetingToMeeting(dbMeeting) {
  if (!dbMeeting) return null

  return {
    id: dbMeeting.id,
    hostId: dbMeeting.host_id,
    title: dbMeeting.title,
    description: dbMeeting.description,
    location: dbMeeting.location,
    locationDetail: dbMeeting.location_detail,
    meetingDatetime: dbMeeting.meeting_datetime,
    maxParticipants: dbMeeting.max_participants,
    currentParticipants: dbMeeting.current_participants,
    purpose: dbMeeting.purpose,
    status: dbMeeting.status,
    imageUrl: dbMeeting.image_url,
    kakaoOpenchatLink: dbMeeting.kakao_openchat_link,
    createdAt: dbMeeting.created_at,
    host: dbMeeting.host,
  }
}

export default {
  mapDbProfileToUser,
  mapDbMeetingToMeeting,
}
