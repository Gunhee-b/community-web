import { useState } from 'react';
import { Calendar, MessageCircle, Image as ImageIcon, X } from 'lucide-react';
import TopNavBar from '../TopNavBar';

interface QuestionDetailScreenProps {
  onBack: () => void;
  questionId: number;
  theme: 'light' | 'dark';
}

export default function QuestionDetailScreen({ onBack, questionId, theme }: QuestionDetailScreenProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const isDark = theme === 'dark';

  const question = {
    id: questionId,
    question: '오늘 가장 기억에 남는 순간은 무엇인가요?',
    date: '11월 8일',
    answerCount: 24,
  };

  const answers = [
    {
      id: 1,
      user: '김민수',
      avatar: '김',
      answer: '오늘 아침에 본 일출이 정말 아름다웠어요. 맑은 하늘과 함께 시작하는 하루가 기분 좋았습니다.',
      time: '오전 8:30',
      images: [],
    },
    {
      id: 2,
      user: '이지은',
      avatar: '이',
      answer: '친구와 오랜만에 만나서 이야기 나눈 시간이 가장 기억에 남아요. 서로의 근황을 공유하며 즐거운 시간을 보냈습니다.',
      time: '오전 10:15',
      images: [],
    },
    {
      id: 3,
      user: '박준영',
      avatar: '박',
      answer: '업무 프로젝트를 성공적으로 마무리한 순간! 팀원들과 함께 고생한 보람이 있었어요.',
      time: '오후 2:45',
      images: [],
    },
    {
      id: 4,
      user: '최수진',
      avatar: '최',
      answer: '저녁에 본 노을이 정말 환상적이었어요. 하늘이 분홍빛과 주황빛으로 물들어서 사진도 찍었답니다.',
      time: '오후 6:20',
      images: ['sunset1', 'sunset2'],
    },
  ];

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      setShowAnswerForm(false);
      setAnswer('');
      setImages([]);
    }
  };

  const handleImageUpload = () => {
    if (images.length < 2) {
      setImages([...images, 'new-image']);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TopNavBar title="질문 상세" onBack={onBack} theme={theme} />

      <div className="pb-24 max-w-md mx-auto">
        {/* Question Card */}
        <div className="px-4 py-4">
          <div className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} />
              <span className="text-sm opacity-90">{question.date}</span>
            </div>
            <h1 className="text-xl mb-4">{question.question}</h1>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="text-sm">{question.answerCount}개의 답변</span>
            </div>
          </div>
        </div>

        {/* Answers List */}
        <div className="px-4 space-y-4">
          <h2 className={`${isDark ? 'text-white' : 'text-gray-900'}`}>모든 답변</h2>
          {answers.map((ans) => (
            <div key={ans.id} className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl p-4 shadow`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-full flex items-center justify-center text-white flex-shrink-0">
                  {ans.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>{ans.user}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{ans.time}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{ans.answer}</p>
                </div>
              </div>
              {ans.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {ans.images.map((img, idx) => (
                    <div key={idx} className="w-32 h-32 bg-gradient-to-br from-orange-300 to-pink-400 rounded-lg"></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Answer Form Modal */}
      {showAnswerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div
            className={`w-full max-w-md ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } rounded-t-3xl p-6 space-y-4 animate-slide-up`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={isDark ? 'text-white' : 'text-gray-900'}>답변 작성</h3>
              <button onClick={() => setShowAnswerForm(false)}>
                <X size={24} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="당신의 답변을 공유해주세요..."
              rows={6}
              className={`w-full px-4 py-3 rounded-xl ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              } border focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none`}
            />

            {/* Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  이미지 (최대 2장)
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {images.length}/2
                </span>
              </div>
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg"></div>
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF3B30] text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 2 && (
                  <button
                    onClick={handleImageUpload}
                    className={`w-20 h-20 rounded-lg border-2 border-dashed ${
                      isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
                    } flex items-center justify-center`}
                  >
                    <ImageIcon size={24} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmitAnswer}
              className="w-full py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors"
            >
              답변 제출
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t p-4 safe-bottom`}>
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setShowAnswerForm(true)}
            className="w-full py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors"
          >
            답변 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}
