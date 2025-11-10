import { MessageCircle, Calendar } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface QuestionsScreenProps {
  onQuestionDetail: (id: number) => void;
  theme: 'light' | 'dark';
}

export default function QuestionsScreen({ onQuestionDetail, theme }: QuestionsScreenProps) {
  const isDark = theme === 'dark';

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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} pb-20`}>
      <TopNavBar title="질문" theme={theme} />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Today's Question Banner */}
        {questions
          .filter((q) => q.isToday)
          .map((question) => (
            <div
              key={question.id}
              onClick={() => onQuestionDetail(question.id)}
              className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-6 text-white cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/20 text-xs px-2 py-1 rounded">오늘의 질문</span>
                <span className="text-sm opacity-90">{question.date}</span>
              </div>
              <h2 className="text-lg mb-4">{question.question}</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} />
                  <span className="text-sm">{question.answerCount}개의 답변</span>
                </div>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                  답변하기 →
                </button>
              </div>
            </div>
          ))}

        {/* Past Questions */}
        <div>
          <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>이전 질문</h3>
          <div className="space-y-3">
            {questions
              .filter((q) => !q.isToday)
              .map((question) => (
                <div
                  key={question.id}
                  onClick={() => onQuestionDetail(question.id)}
                  className={`${
                    isDark ? 'bg-gray-900' : 'bg-white'
                  } rounded-xl p-4 shadow cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{question.date}</span>
                  </div>
                  <h4 className={`mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{question.question}</h4>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <MessageCircle size={16} />
                      <span>{question.answerCount}개의 답변</span>
                    </div>
                    <button className="text-sm text-[#007AFF]">답변 보기</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
