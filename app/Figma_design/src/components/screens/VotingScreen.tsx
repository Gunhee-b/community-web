import { TrendingUp, Trophy, Heart } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface VotingScreenProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export default function VotingScreen({ onBack, theme }: VotingScreenProps) {
  const isDark = theme === 'dark';

  const votingPeriod = {
    month: '11월',
    startDate: '11월 1일',
    endDate: '11월 15일',
    status: 'active',
  };

  const nominees = [
    {
      id: 1,
      type: 'meeting',
      title: '강남 카페 모임',
      description: '즐거운 카페 투어 모임',
      author: '김민수',
      votes: 45,
      hasVoted: false,
    },
    {
      id: 2,
      type: 'answer',
      question: '오늘 가장 기억에 남는 순간은?',
      answer: '친구와 오랜만에 만나서 이야기 나눈 시간이 정말 좋았어요.',
      author: '이지은',
      votes: 38,
      hasVoted: true,
    },
    {
      id: 3,
      type: 'meeting',
      title: '주말 등산',
      description: '북한산 백운대 코스',
      author: '박준영',
      votes: 52,
      hasVoted: false,
    },
    {
      id: 4,
      type: 'answer',
      question: '최근에 읽은 책 중 추천하고 싶은 책은?',
      answer: '\'아몬드\'라는 책을 읽었는데 정말 감동적이었어요. 공감 능력에 대해 생각해보게 됩니다.',
      author: '최수진',
      votes: 41,
      hasVoted: false,
    },
    {
      id: 5,
      type: 'meeting',
      title: '보드게임 카페',
      description: '신나는 보드게임 파티',
      author: '정민호',
      votes: 36,
      hasVoted: false,
    },
  ];

  const topVoted = nominees.sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-6`}>
      <TopNavBar title="베스트 투표" onBack={onBack} theme={theme} />

      <div className="px-4 py-4 max-w-md mx-auto space-y-6">
        {/* Voting Period Banner */}
        <div className="bg-gradient-to-br from-[#FF9500] to-[#FF3B30] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} />
            <span className="text-sm opacity-90">{votingPeriod.month} 베스트 투표</span>
          </div>
          <h2 className="text-lg mb-2">이달의 베스트를 선택해주세요!</h2>
          <p className="text-sm opacity-90 mb-4">
            투표 기간: {votingPeriod.startDate} - {votingPeriod.endDate}
          </p>
          <div className="bg-white/20 rounded-lg px-3 py-2 inline-block">
            <span className="text-sm">총 {nominees.length}개 후보</span>
          </div>
        </div>

        {/* Top 3 Current Leaders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={20} className={isDark ? 'text-yellow-500' : 'text-yellow-600'} />
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>현재 순위</h3>
          </div>
          <div className="space-y-3">
            {topVoted.map((item, index) => (
              <div
                key={item.id}
                className={`${
                  isDark ? 'bg-gray-900' : 'bg-white'
                } rounded-xl p-4 shadow flex items-center gap-4`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : 'bg-orange-600'
                  }`}
                >
                  <span className="text-white text-xl">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        item.type === 'meeting'
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-[#5856D6] text-white'
                      }`}
                    >
                      {item.type === 'meeting' ? '모임' : '답변'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      by {item.author}
                    </span>
                  </div>
                  <h4 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                    {item.type === 'meeting' ? item.title : item.question}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-1`}>
                    {item.type === 'meeting' ? item.description : item.answer}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl text-[#FF3B30] mb-1">{item.votes}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>표</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Nominees */}
        <div>
          <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>모든 후보</h3>
          <div className="space-y-3">
            {nominees.map((item) => (
              <div
                key={item.id}
                className={`${
                  isDark ? 'bg-gray-900' : 'bg-white'
                } rounded-xl p-4 shadow ${
                  item.hasVoted ? 'border-2 border-[#007AFF]' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          item.type === 'meeting'
                            ? 'bg-[#007AFF] text-white'
                            : 'bg-[#5856D6] text-white'
                        }`}
                      >
                        {item.type === 'meeting' ? '모임' : '답변'}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        by {item.author}
                      </span>
                      {item.hasVoted && (
                        <span className="text-xs bg-[#007AFF] text-white px-2 py-0.5 rounded">
                          투표함
                        </span>
                      )}
                    </div>
                    <h4 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.type === 'meeting' ? item.title : item.question}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.type === 'meeting' ? item.description : item.answer}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Heart size={16} className={item.hasVoted ? 'fill-[#FF3B30] text-[#FF3B30]' : ''} />
                    <span>{item.votes}표</span>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      item.hasVoted
                        ? isDark
                          ? 'bg-gray-800 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                        : 'bg-[#007AFF] text-white hover:bg-[#0062CC]'
                    } transition-colors text-sm`}
                    disabled={item.hasVoted}
                  >
                    {item.hasVoted ? '투표 완료' : '투표하기'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-4 shadow text-center`}>
          <Trophy size={32} className={`mx-auto mb-2 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />
          <h4 className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>투표 결과 발표</h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {votingPeriod.endDate} 이후 최종 결과가 공개됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
