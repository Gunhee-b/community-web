import { useState } from 'react';
import { Calendar, MapPin, Users, Plus, MessageSquare } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface MeetingsScreenProps {
  onMeetingDetail: (id: number) => void;
  onCreateMeeting: () => void;
  theme: 'light' | 'dark';
}

export default function MeetingsScreen({ onMeetingDetail, onCreateMeeting, theme }: MeetingsScreenProps) {
  const [activeTab, setActiveTab] = useState<'casual' | 'regular'>('casual');
  const isDark = theme === 'dark';

  const casualMeetings = [
    {
      id: 1,
      title: '강남 카페 모임',
      description: '편하게 커피 마시면서 이야기 나눠요',
      date: '11월 9일',
      time: '14:00',
      location: '강남역 스타벅스',
      host: '김민수',
      hostIntro: '카페 투어를 좋아하는 김민수입니다',
      participants: 8,
      maxParticipants: 12,
      hasKakaoChat: true,
      status: 'open',
    },
    {
      id: 2,
      title: '주말 등산',
      description: '북한산 백운대 코스로 가볍게 등산해요',
      date: '11월 10일',
      time: '09:00',
      location: '북한산 백운대 입구',
      host: '박준영',
      hostIntro: '등산을 즐기는 박준영입니다',
      participants: 15,
      maxParticipants: 20,
      hasKakaoChat: true,
      status: 'open',
    },
    {
      id: 3,
      title: '보드게임 카페',
      description: '신나는 보드게임으로 즐거운 시간 보내요',
      date: '11월 11일',
      time: '18:00',
      location: '홍대 보드게임 카페',
      host: '이지은',
      hostIntro: '보드게임 마니아 이지은입니다',
      participants: 10,
      maxParticipants: 10,
      hasKakaoChat: true,
      status: 'full',
    },
  ];

  const regularMeetings = [
    {
      id: 4,
      title: '주간 독서 모임',
      description: '매주 화요일 책을 읽고 토론해요',
      date: '매주 화요일',
      time: '19:00',
      location: '강남 스터디 카페',
      host: '최수진',
      hostIntro: '책을 사랑하는 최수진입니다',
      participants: 8,
      maxParticipants: 15,
      hasKakaoChat: true,
      status: 'open',
    },
    {
      id: 5,
      title: '월간 영화 감상',
      description: '한 달에 한 번 영화관에서 영화 관람',
      date: '매월 첫째 주 토요일',
      time: '14:00',
      location: 'CGV 강남',
      host: '정민호',
      hostIntro: '영화광 정민호입니다',
      participants: 12,
      maxParticipants: 20,
      hasKakaoChat: true,
      status: 'open',
    },
  ];

  const meetings = activeTab === 'casual' ? casualMeetings : regularMeetings;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-20`}>
      <TopNavBar title="모임" theme={theme} />

      {/* Tabs */}
      <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="flex max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('casual')}
            className={`flex-1 py-3 text-center relative ${
              activeTab === 'casual'
                ? 'text-[#007AFF]'
                : isDark
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}
          >
            자율 모임
            {activeTab === 'casual' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('regular')}
            className={`flex-1 py-3 text-center relative ${
              activeTab === 'regular'
                ? 'text-[#007AFF]'
                : isDark
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}
          >
            정기 모임
            {activeTab === 'regular' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007AFF]"></div>
            )}
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() => onMeetingDetail(meeting.id)}
            className={`${
              isDark ? 'bg-gray-900' : 'bg-white'
            } rounded-xl overflow-hidden shadow cursor-pointer`}
          >
            {/* Meeting Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-400"></div>

            {/* Meeting Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{meeting.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{meeting.description}</p>
                </div>
                {meeting.status === 'full' && (
                  <span className="bg-[#FF9500] text-white text-xs px-2 py-1 rounded">마감</span>
                )}
              </div>

              {/* Date & Time */}
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                <Calendar size={16} />
                <span>{meeting.date} {meeting.time}</span>
              </div>

              {/* Location */}
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                <MapPin size={16} />
                <span>{meeting.location}</span>
              </div>

              {/* Participants */}
              <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                <Users size={16} />
                <span>{meeting.participants}/{meeting.maxParticipants}명 참여</span>
              </div>

              {/* Host Info */}
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white text-xs">
                    {meeting.host[0]}
                  </div>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{meeting.host}</span>
                  <span className="text-xs bg-[#5856D6] text-white px-2 py-0.5 rounded">호스트</span>
                </div>
                <p className="text-xs ml-8">{meeting.hostIntro}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {meeting.status === 'full' ? (
                  <button className="flex-1 py-2.5 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed">
                    마감됨
                  </button>
                ) : (
                  <button className="flex-1 py-2.5 rounded-lg bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors">
                    참여하기
                  </button>
                )}
                {meeting.hasKakaoChat && (
                  <button className="px-4 py-2.5 rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors flex items-center gap-2">
                    <MessageSquare size={18} />
                    카카오톡
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onCreateMeeting}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#007AFF] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0062CC] transition-colors z-10"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
