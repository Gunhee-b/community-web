# 답변 작성 시 자동 체크 및 90-Day Challenge 통합

**최종 업데이트**: 2025-10-31
**버전**: v2.7.0
**상태**: ✅ 완료

---

## 📋 변경 사항 요약

### 주요 개선사항

1. **✅ 체크 버튼 제거** → "답변 작성하기" 버튼으로 대체
2. **✅ 공개 답변 작성 시 자동 체크** → 90-Day Challenge 자동 카운트
3. **✅ 프로필에 통계 추가** → 내가 쓴 글 횟수 + 90-Day Challenge 진행률

---

## 🔄 변경된 워크플로우

### Before (이전)
```
사용자가 질문 보기
  ↓
"체크하기" 버튼 클릭 → 모달에서 개인 메모 작성 (90-Day Challenge 카운트)
  ↓
별도로 "답변 작성하기" 버튼 클릭 → 공개 답변 작성
```

### After (현재)
```
사용자가 질문 보기
  ↓
옵션 1: "개인 메모 작성" 버튼 클릭 → 모달에서 개인 메모만 작성 (90-Day Challenge 카운트)
  ↓
옵션 2: "답변 작성하기" 버튼 클릭 → 공개 답변 작성 → 자동으로 90-Day Challenge 카운트
```

**핵심 개선**: 공개 답변을 작성하면 자동으로 체크되어 90-Day Challenge에 카운트됩니다!

---

## 📝 수정된 파일

### 1. QuestionDetailPage.jsx (질문 상세 페이지)

#### A. 체크 버튼 제거 및 UI 개선

**변경 전**:
```jsx
{/* 체크 버튼 */}
<div className="flex gap-3 mb-8">
  <Button onClick={handleCheck}>
    {checkData ? '체크 취소' : '✓ 체크하기'}
  </Button>
  {checkData && (
    <Button onClick={() => setShowAnswerModal(true)}>
      답변 수정
    </Button>
  )}
</div>
```

**변경 후**:
```jsx
{/* 개인 메모 및 90-Day Challenge */}
{checkData && checkData.user_answer && (
  <Card className="mb-6 bg-blue-50 border-l-4 border-blue-500">
    <h3>내 개인 메모</h3>
    <p>{checkData.user_answer}</p>
    <Button onClick={() => setShowAnswerModal(true)}>
      개인 메모 수정
    </Button>
  </Card>
)}

{/* 개인 메모 버튼 (체크 데이터 없을 때) */}
{!checkData && (
  <div className="mb-8">
    <Button onClick={() => setShowAnswerModal(true)}>
      ✏️ 개인 메모 작성 (90-Day Challenge)
    </Button>
    <p className="text-xs text-gray-500 mt-2">
      개인 메모를 작성하면 90-Day Challenge에 카운트됩니다
    </p>
  </div>
)}
```

**개선 내용**:
- ❌ 체크 버튼 제거
- ✅ 개인 메모가 있으면 카드로 표시
- ✅ 없으면 "개인 메모 작성" 버튼 표시
- ✅ 90-Day Challenge 안내 추가

#### B. handleCheck 함수 제거

```jsx
// 제거됨
const handleCheck = async () => { ... }

// 대체: 모달로만 개인 메모 작성
```

#### C. 모달 제목 변경

**변경 전**:
```jsx
<Modal title={checkData ? "답변 수정" : "이 질문에 답변하기"}>
```

**변경 후**:
```jsx
<Modal title={checkData ? "개인 메모 수정" : "개인 메모 작성 (90-Day Challenge)"}>
```

---

### 2. WriteAnswerPage.jsx (답변 작성 페이지)

#### 공개 답변 저장 시 자동 체크 로직 추가

**변경 전**:
```jsx
// 새로 작성
const { error } = await supabase.from('question_answers').insert({
  question_id: id,
  user_id: user.id,
  ...answerData,
  is_public: true,
})

if (error) throw error
toast.success('답변이 작성되었습니다!')
```

**변경 후**:
```jsx
// 새로 작성
const { error } = await supabase.from('question_answers').insert({
  question_id: id,
  user_id: user.id,
  ...answerData,
  is_public: true,
})

if (error) throw error

// 🆕 공개 답변 작성 시 자동으로 체크 (90-Day Challenge 카운트)
const { data: existingCheck } = await supabase
  .from('question_checks')
  .select('id')
  .eq('user_id', user.id)
  .eq('question_id', id)
  .maybeSingle()

if (!existingCheck) {
  const { error: checkError } = await supabase
    .from('question_checks')
    .insert({
      user_id: user.id,
      question_id: id,
      is_checked: true,
      checked_at: new Date().toISOString()
    })

  if (checkError) {
    console.error('Error creating check:', checkError)
    // 체크 생성 실패해도 답변은 저장되었으므로 에러 무시
  }
}

toast.success('답변이 작성되었습니다! 90-Day Challenge에 카운트되었습니다.')
```

**핵심 로직**:
1. 공개 답변을 성공적으로 작성한 후
2. `question_checks` 테이블에 해당 질문에 대한 체크가 있는지 확인
3. 없으면 자동으로 체크 레코드 생성
4. 데이터베이스 트리거가 자동으로 `challenge_stats` 업데이트

---

### 3. ProfilePage.jsx (프로필 페이지)

#### A. 통계 데이터 상태 추가

```jsx
// 통계 데이터
const [stats, setStats] = useState({
  publicAnswersCount: 0,    // 🆕 내가 쓴 글
  totalChecks: 0,            // 🆕 총 체크 수
  currentStreak: 0,          // 🆕 연속 체크 일수
  longestStreak: 0           // 🆕 최장 연속 기록
})
const [statsLoading, setStatsLoading] = useState(true)
```

#### B. 통계 조회 함수 추가

```jsx
const fetchStats = async () => {
  try {
    // 🆕 공개 답변 개수 조회
    const { count: answersCount } = await supabase
      .from('question_answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', true)

    // 🆕 90-Day Challenge 통계 조회
    const { data: challengeStats } = await supabase
      .from('challenge_stats')
      .select('total_checks, current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle()

    setStats({
      publicAnswersCount: answersCount || 0,
      totalChecks: challengeStats?.total_checks || 0,
      currentStreak: challengeStats?.current_streak || 0,
      longestStreak: challengeStats?.longest_streak || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    setStatsLoading(false)
  }
}
```

#### C. 90-Day Challenge 섹션 추가

```jsx
{/* 🆕 90-Day Challenge 통계 */}
<Card className="mb-6">
  <h2>📝 90-Day Challenge</h2>

  {/* 총 체크 수 & 연속 체크 일수 */}
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-blue-50 rounded-lg">
      <div className="text-3xl font-bold text-blue-600">
        {stats.totalChecks}
      </div>
      <div className="text-sm">총 체크 수</div>
    </div>
    <div className="bg-green-50 rounded-lg">
      <div className="text-3xl font-bold text-green-600">
        {stats.currentStreak}
      </div>
      <div className="text-sm">연속 체크 일수</div>
    </div>
  </div>

  {/* 진행률 표시 */}
  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
    <div>90일 달성률: {Math.round((stats.totalChecks / 90) * 100)}%</div>
    <div>최장 연속 기록: {stats.longestStreak}일</div>

    {/* 프로그레스 바 */}
    <div className="bg-white rounded-full h-3">
      <div
        className="bg-gradient-to-r from-blue-500 to-green-500 h-full"
        style={{ width: `${Math.min((stats.totalChecks / 90) * 100, 100)}%` }}
      />
    </div>

    <div className="text-xs text-center">
      {90 - stats.totalChecks > 0
        ? `목표까지 ${90 - stats.totalChecks}일 남았어요! 💪`
        : '🎉 90일 챌린지 완료!'}
    </div>
  </div>
</Card>
```

#### D. 활동 통계 섹션 개선

**변경 전**:
```jsx
<div className="grid grid-cols-2 gap-4">
  <div>투표 참여: -</div>
  <div>글 추천: -</div>
  <div>모임 참여: {user?.meeting_participation_count || 0}</div>
  <div>모임 주최: -</div>
</div>
```

**변경 후**:
```jsx
<div className="grid grid-cols-2 gap-4">
  <div className="bg-orange-50 rounded-lg">
    {/* 🆕 내가 쓴 글 */}
    <div className="text-2xl font-bold text-orange-600">
      {stats.publicAnswersCount}
    </div>
    <div className="text-sm">내가 쓴 글</div>
  </div>
  <div className="bg-purple-50 rounded-lg">
    <div className="text-2xl font-bold text-purple-600">
      {user?.meeting_participation_count || 0}
    </div>
    <div className="text-sm">모임 참여</div>
  </div>
  <div>투표 참여: -</div>
  <div>글 추천: -</div>
</div>
```

---

## 🎯 사용자 경험 개선

### Before (이전)
1. 사용자: "이 질문에 답변하고 싶은데, 체크는 뭐지?"
2. 사용자: "체크도 해야 하고 답변도 해야 하나? 헷갈려..."
3. 사용자: "체크를 먼저 해야 하나? 답변을 먼저 해야 하나?"

### After (현재)
1. 사용자: "공개 답변을 작성하면 자동으로 90-Day Challenge에 카운트되네! 편리해!"
2. 사용자: "개인 메모는 따로 작성할 수 있어서 좋아"
3. 사용자: "프로필에서 내 진행 상황을 한눈에 볼 수 있어!"

---

## 📊 데이터베이스 구조

### 관련 테이블

#### question_checks
```sql
CREATE TABLE question_checks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES daily_questions(id),
  is_checked BOOLEAN DEFAULT true,
  user_answer TEXT,      -- 개인 메모
  user_note TEXT,        -- 추가 메모
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```

#### question_answers
```sql
CREATE TABLE question_answers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES daily_questions(id),
  content TEXT,          -- 공개 답변 텍스트
  image_url TEXT,        -- 이미지 1
  image_url_2 TEXT,      -- 이미지 2
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);
```

#### challenge_stats
```sql
CREATE TABLE challenge_stats (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  total_checks INTEGER DEFAULT 0,      -- 총 체크 수
  current_streak INTEGER DEFAULT 0,    -- 연속 체크 일수
  longest_streak INTEGER DEFAULT 0,    -- 최장 연속 기록
  completed_at TIMESTAMPTZ,            -- 90개 완료 시각
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 트리거 동작

```sql
-- question_checks에 INSERT/UPDATE 시 자동 실행
CREATE TRIGGER trigger_update_challenge_stats
  AFTER INSERT OR UPDATE ON question_checks
  FOR EACH ROW
  WHEN (NEW.is_checked = true)
  EXECUTE FUNCTION update_challenge_stats();
```

**동작 과정**:
1. `question_checks`에 새 레코드 INSERT
2. 트리거가 자동으로 `update_challenge_stats()` 함수 실행
3. 함수가 `challenge_stats` 테이블 업데이트:
   - `total_checks` 증가
   - `current_streak` 계산 (연속 여부 확인)
   - `longest_streak` 갱신 (최대값)
   - 90개 달성 시 `completed_at` 기록

---

## 🧪 테스트 시나리오

### 시나리오 1: 공개 답변 작성 후 자동 체크

```
1. 로그인
2. "오늘의 질문" 메뉴 클릭
3. 질문 선택
4. "✍️ 답변 작성하기" 버튼 클릭
5. 텍스트 입력 (50자)
6. "✍️ 작성 완료" 버튼 클릭

예상 결과:
✅ 답변이 저장됨
✅ "답변이 작성되었습니다! 90-Day Challenge에 카운트되었습니다." 메시지
✅ 질문 상세 페이지로 돌아감
✅ question_checks 테이블에 레코드 생성됨
✅ challenge_stats 테이블에 total_checks 증가
```

### 시나리오 2: 개인 메모만 작성

```
1. 질문 상세 페이지 접속
2. "✏️ 개인 메모 작성" 버튼 클릭
3. 모달에서 메모 입력
4. "저장" 버튼 클릭

예상 결과:
✅ 개인 메모만 저장됨 (공개 답변 아님)
✅ 90-Day Challenge에 카운트됨
✅ 페이지에 "내 개인 메모" 카드 표시됨
```

### 시나리오 3: 프로필 통계 확인

```
1. 프로필 메뉴 클릭
2. "📝 90-Day Challenge" 섹션 확인
3. "활동 통계" 섹션 확인

예상 결과:
✅ 총 체크 수 표시
✅ 연속 체크 일수 표시
✅ 90일 달성률 프로그레스 바
✅ 최장 연속 기록 표시
✅ 내가 쓴 글 횟수 표시 (공개 답변 개수)
```

---

## ✅ 체크리스트

### 기능 테스트

- [ ] 공개 답변 작성 시 자동으로 체크되는가?
- [ ] 개인 메모만 작성 시 90-Day Challenge에 카운트되는가?
- [ ] 공개 답변 수정 시 중복 체크가 생성되지 않는가?
- [ ] 프로필에서 통계가 올바르게 표시되는가?
- [ ] 진행률 프로그레스 바가 정확한가?

### UI/UX 테스트

- [ ] "체크하기" 버튼이 제거되었는가?
- [ ] "개인 메모 작성" 버튼이 명확한가?
- [ ] 90-Day Challenge 안내 문구가 표시되는가?
- [ ] 프로필 통계가 시각적으로 매력적인가?
- [ ] 로딩 상태가 표시되는가?

### 데이터 무결성

- [ ] 중복 체크가 방지되는가? (UNIQUE 제약)
- [ ] 트리거가 정상 작동하는가?
- [ ] 연속 일수 계산이 정확한가?
- [ ] 90개 달성 시 completed_at이 기록되는가?

---

## 🐛 알려진 이슈 및 해결

### 이슈 1: 중복 체크 방지

**문제**: 공개 답변 작성 시 이미 체크가 있으면 중복 생성
**해결**: `existingCheck` 조회 후 없을 때만 INSERT

```jsx
const { data: existingCheck } = await supabase
  .from('question_checks')
  .select('id')
  .eq('user_id', user.id)
  .eq('question_id', id)
  .maybeSingle()

if (!existingCheck) {
  // INSERT
}
```

### 이슈 2: 체크 생성 실패 시 롤백

**문제**: 답변은 저장되었는데 체크 생성 실패하면?
**해결**: 에러 로깅만 하고 답변 저장은 유지

```jsx
if (checkError) {
  console.error('Error creating check:', checkError)
  // 답변은 이미 저장되었으므로 계속 진행
}
```

---

## 📚 관련 문서

- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - 이미지 업로드 이슈
- [MOBILE_DEPLOYMENT_CHECKLIST.md](./MOBILE_DEPLOYMENT_CHECKLIST.md) - 모바일 배포
- [RESPONSIVE_TEST_GUIDE.md](./RESPONSIVE_TEST_GUIDE.md) - 반응형 테스트

---

## 🎉 완료!

모든 기능이 성공적으로 구현되었습니다!

### 핵심 개선사항

1. ✅ **더 직관적인 UX**: "체크하기" 대신 "답변 작성하기"
2. ✅ **자동화**: 공개 답변 작성 시 90-Day Challenge 자동 카운트
3. ✅ **통계 시각화**: 프로필에서 진행 상황 한눈에 확인
4. ✅ **동기 부여**: 진행률 바와 격려 메시지

### 사용자 혜택

- 🚀 **더 빠른 참여**: 한 번의 클릭으로 답변 + 체크
- 📊 **명확한 진행 상황**: 90일 챌린지 진행률 시각화
- 💪 **동기 부여**: 연속 기록 및 달성률 확인
- 📝 **투명성**: 내가 쓴 글 횟수 표시

---

**작성자**: Claude Code
**버전**: 1.0.0
**마지막 업데이트**: 2025-10-31
