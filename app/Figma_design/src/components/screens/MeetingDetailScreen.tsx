import { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, Users, MessageSquare, Send, Image as ImageIcon, X } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface MeetingDetailScreenProps {
  onBack: () => void;
  meetingId: number;
  theme: 'light' | 'dark';
}

export default function MeetingDetailScreen({ onBack, meetingId, theme }: MeetingDetailScreenProps) {
  const [message, setMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const meeting = {
    id: meetingId,
    title: '강남 카페 모임',
    description: '편하게 커피 마시면서 이야기 나눠요. 새로운 사람들을 만나고 즐거운 시간을 보내실 수 있습니다.',
    date: '11월 9일',
    time: '14:00',
    location: '강남역 스타벅스 리저브',
    address: '서울 강남구 테헤란로 152',
    host: '김민수',
    hostIntro: '카페 투어를 좋아하는 김민수입니다. 다양한 사람들과 이야기 나누는 것을 좋아합니다!',
    participants: 8,
    maxParticipants: 12,
    hasKakaoChat: true,
  };

  const participants = [
    { id: 1, name: '김민수', role: 'host', avatar: '김' },
    { id: 2, name: '이지은', role: 'member', avatar: '이' },
    { id: 3, name: '박준영', role: 'member', avatar: '박' },
    { id: 4, name: '최수진', role: 'member', avatar: '최' },
    { id: 5, name: '정민호', role: 'member', avatar: '정' },
    { id: 6, name: '강지수', role: 'member', avatar: '강' },
    { id: 7, name: '윤서연', role: 'member', avatar: '윤' },
    { id: 8, name: '한동훈', role: 'member', avatar: '한' },
  ];

  const chatMessages = [
    {
      id: 1,
      user: '김민수',
      avatar: '김',
      message: '안녕하세요! 모임에 참여해주셔서 감사합니다.',
      time: '10:30',
      isOwn: false,
    },
    {
      id: 2,
      user: '이지은',
      avatar: '이',
      message: '기대됩니다! 어떤 커피를 주문하시나요?',
      time: '10:35',
      isOwn: false,
    },
    {
      id: 3,
      user: '나',
      avatar: '나',
      message: '저는 아메리카노 좋아해요',
      time: '10:40',
      isOwn: true,
    },
    {
      id: 4,
      user: '박준영',
      avatar: '박',
      message: '날씨가 좋네요. 야외 테라스에서 만날까요?',
      time: '11:00',
      isOwn: false,
    },
  ];

  useEffect(() => {
    if (showChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showChat, chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TopNavBar title="모임 상세" onBack={onBack} theme={theme} />

      <div className="pb-24 max-w-md mx-auto">
        {/* Meeting Image */}
        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-400"></div>

        {/* Meeting Info */}
        <div className="px-4 py-4 space-y-4">
          {/* Title & Description */}
          <div>
            <h1 className={`text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{meeting.title}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{meeting.description}</p>
          </div>

          {/* Details Card */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-4 shadow space-y-3`}>
            <div className="flex items-start gap-3">
              <Calendar size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <div>
                <div className={isDark ? 'text-white' : 'text-gray-900'}>{meeting.date} {meeting.time}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>토요일</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <div>
                <div className={isDark ? 'text-white' : 'text-gray-900'}>{meeting.location}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{meeting.address}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
              <div>
                <div className={isDark ? 'text-white' : 'text-gray-900'}>
                  {meeting.participants}/{meeting.maxParticipants}명 참여
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {meeting.maxParticipants - meeting.participants}자리 남음
                </div>
              </div>
            </div>
          </div>

          {/* Host Info */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-4 shadow`}>
            <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>호스트</h3>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white">
                {meeting.host[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{meeting.host}</span>
                  <span className="text-xs bg-[#5856D6] text-white px-2 py-0.5 rounded">호스트</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{meeting.hostIntro}</p>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-4 shadow`}>
            <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>참여자 ({participants.length})</h3>
            <div className="grid grid-cols-4 gap-3">
              {participants.map((participant) => (
                <div key={participant.id} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white mx-auto mb-1">
                    {participant.avatar}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                    {participant.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Section */}
          <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow overflow-hidden`}>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-full p-4 flex items-center justify-between ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <span className={isDark ? 'text-white' : 'text-gray-900'}>실시간 채팅</span>
              </div>
              <span className="bg-[#FF3B30] text-white text-xs px-2 py-1 rounded-full">3</span>
            </button>

            {showChat && (
              <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                      {!msg.isOwn && (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
                          {msg.avatar}
                        </div>
                      )}
                      <div className={`flex-1 ${msg.isOwn ? 'flex flex-col items-end' : ''}`}>
                        {!msg.isOwn && (
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            {msg.user}
                          </div>
                        )}
                        <div
                          className={`inline-block px-4 py-2 rounded-2xl ${
                            msg.isOwn
                              ? 'bg-[#007AFF] text-white'
                              : isDark
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.message}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className={`p-3 border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <ImageIcon size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="메시지를 입력하세요..."
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                      } border focus:outline-none focus:ring-2 focus:ring-[#007AFF]`}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0062CC] transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t p-4 safe-bottom`}>
        <div className="max-w-md mx-auto flex gap-3">
          {isJoined ? (
            <>
              <button
                onClick={() => setIsJoined(false)}
                className="flex-1 py-3 rounded-xl border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors"
              >
                참여 취소
              </button>
              <button className="flex-1 py-3 rounded-xl bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                카카오톡 오픈채팅
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsJoined(true)}
              className="flex-1 py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors"
            >
              모임 참여하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
