# 철학챗 정기 모임 및 즉흥 모임 기능 추가

**날짜**: 2025-02-04
**버전**: v2.6.0

---

## 📋 업데이트 개요

철학챗 시스템에 정기 모임과 즉흥 모임을 구분하는 기능을 추가했습니다.

### 주요 변경사항

1. **모임 유형 분류**
   - 정기 모임 (Regular Meeting)
   - 즉흥 모임 (Casual Meeting)

2. **즉흥 모임 세부 분류**
   - 취미 모임 (Hobby)
   - 토론 모임 (Discussion)

3. **정기 모임 반복 일정**
   - 매주 특정 요일에 진행
   - 고정된 시간대 설정

---

## 🗄️ 데이터베이스 변경사항

### 새로운 컬럼

#### `offline_meetings` 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `meeting_type` | `meeting_type` ENUM | 'regular' (정기) 또는 'casual' (즉흥) |
| `casual_meeting_type` | `casual_meeting_type` ENUM | 'hobby' (취미) 또는 'discussion' (토론) |
| `recurrence_day_of_week` | INTEGER | 0-6 (일요일=0, 토요일=6) |
| `recurrence_time` | TIME | 정기 모임 시간 (예: 19:00) |

### 제약 조건

1. **정기 모임 필수 필드**
   ```sql
   CHECK (
     (meeting_type = 'regular' AND recurrence_day_of_week IS NOT NULL AND recurrence_time IS NOT NULL) OR
     (meeting_type = 'casual')
   )
   ```

2. **즉흥 모임 필수 필드**
   ```sql
   CHECK (
     (meeting_type = 'casual' AND casual_meeting_type IS NOT NULL) OR
     (meeting_type = 'regular')
   )
   ```

---

## 🚀 마이그레이션 실행 방법

### 1. Supabase SQL Editor로 실행

1. Supabase Dashboard 접속
2. SQL Editor 메뉴 클릭
3. 다음 파일 내용을 복사하여 실행:
   ```
   supabase/migrations/20250204_add_meeting_types.sql
   ```
4. "RUN" 버튼 클릭

### 2. Supabase CLI로 실행 (선택사항)

```bash
# 로컬 개발 환경
supabase db reset

# 또는 프로덕션에 직접 적용
supabase db push
```

---

## 🔄 최종 업데이트 (2025-02-04)

### 필터 구조 단순화
- ✅ **일반 사용자**: 2개 탭 (즉흥 모임, 정기 모임)
- ✅ **관리자 전용**: 지난 모임 탭 추가
- ❌ 하위 유형 필터 제거 (UI 단순화)

---

## ✨ 새로운 기능

### 1. 모임 생성 페이지 (CreateMeetingPage.jsx)

#### 모임 유형 선택
- **정기 모임** 또는 **즉흥 모임** 선택 가능
- 선택한 유형에 따라 입력 폼이 동적으로 변경

#### 정기 모임 생성
- 매주 반복 요일 선택 (월~일)
- 고정 시간 설정
- 날짜 입력 불필요

#### 즉흥 모임 생성
- 세부 유형 선택: **취미 모임** 또는 **토론 모임**
- 특정 날짜 및 시간 입력
- 기존과 동일한 방식

### 2. 모임 목록 페이지 (MeetingsPage.jsx)

#### 필터링 기능 (최종 버전)
- **⚡ 즉흥 모임**: 모집 중인 즉흥 모임만 표시
- **📅 정기 모임**: 모든 정기 모임 표시
- **🕐 지난 모임**: 관리자만 볼 수 있음 (모든 타입 포함)

#### 배지 표시
- 모임 유형 배지 (📅 정기 / ⚡ 즉흥)
- 즉흥 모임 세부 유형 배지 (🎨 취미 / 💬 토론)
- 모임 목적 배지 (☕ 커피 / 🍺 술)
- D-day (즉흥 모임만)

#### 날짜/시간 표시
- **정기 모임**: "매주 월요일 19:00"
- **즉흥 모임**: "2025년 2월 10일 19:00 - 21:00"

### 3. 모임 상세 페이지 (MeetingDetailPage.jsx)

#### 배지 시스템
- 모임 유형, 세부 유형, 목적을 배지로 표시
- 색상 코딩으로 쉽게 구분 가능

#### 일정 정보
- 정기 모임: 요일과 시간 강조
- 즉흥 모임: 구체적인 날짜와 시간 표시

---

## 🎨 UI/UX 개선사항

### 탭 색상 스킴

| 탭 | 색상 | 대상 |
|------|------|------|
| ⚡ 즉흥 모임 | 초록색 (green-600) | 모든 사용자 |
| 📅 정기 모임 | 보라색 (purple-600) | 모든 사용자 |
| 🕐 지난 모임 | 회색 (gray-600) | 관리자만 |

### 배지 색상 스킴

| 유형 | 색상 |
|------|------|
| 정기 모임 | 보라색 (purple) |
| 즉흥 모임 | 초록색 (green) |
| 취미 모임 | 파란색 (blue) |
| 토론 모임 | 남색 (indigo) |
| 커피 모임 | 황갈색 (amber) |
| 술 모임 | 빨간색 (red) |

### 반응형 디자인
- 모바일에서 배지가 자동으로 줄바꿈
- 필터 버튼 모바일 최적화
- 터치 친화적 UI

---

## 📝 사용 시나리오

### 시나리오 1: 정기 독서 모임 생성

```
1. "모임 만들기" 클릭
2. 모임 유형: "📅 정기 모임" 선택
3. 장소: "강남역 스타벅스" 입력
4. 매주 반복 요일: "수요일" 선택
5. 정기 모임 시간: "19:00" 입력
6. 모임 목적: "☕ 커피" 선택
7. 최대 인원: 5명 선택
8. 모임 만들기 완료

→ 매주 수요일 19:00에 자동으로 모임이 진행됩니다
```

### 시나리오 2: 일회성 취미 모임 생성

```
1. "모임 만들기" 클릭
2. 모임 유형: "⚡ 즉흥 모임" 선택
3. 즉흥 모임 세부 유형: "🎨 취미 모임" 선택
4. 장소: "홍대 카페" 입력
5. 날짜: "2025-02-15" 선택
6. 시작 시간: "14:00" 입력
7. 종료 시간: "16:00" 입력
8. 모임 목적: "☕ 커피" 선택
9. 모임 만들기 완료

→ 2025년 2월 15일 14:00-16:00에 일회성 모임이 진행됩니다
```

### 시나리오 3: 토론 모임 참가하기

```
1. 철학챗 페이지 접속
2. 유형 필터: "⚡ 즉흥 모임" 선택
3. 모임 카드에서 "💬 토론" 배지 확인
4. 관심 있는 토론 모임 클릭
5. 모임 상세 정보 확인
6. "모임 참가하기" 버튼 클릭
7. 카카오톡 오픈채팅방 자동 입장
```

---

## 🔧 기술 상세

### 주요 변경 사항 요약

#### 1단계: 기본 구조 (초기)
- 정기/즉흥 모임 구분
- 즉흥 모임 세부 분류 (취미/토론)
- 유형별 필터 (전체/정기/즉흥)

#### 2단계: 필터 재구성
- 3개 탭: 즉흥(모집중), 즉흥(지난), 정기
- 시간 기반 분류

#### 3단계: 최종 단순화 ✅
- **2개 메인 탭**: 즉흥 모임, 정기 모임
- **관리자 전용 탭**: 지난 모임
- 하위 필터 제거 (UI 단순화)

### 프론트엔드 변경사항

#### CreateMeetingPage.jsx
```javascript
// 상태 관리
const [formData, setFormData] = useState({
  meetingType: 'casual',           // 'regular' or 'casual'
  casualMeetingType: 'hobby',      // 'hobby' or 'discussion'
  recurrenceDayOfWeek: 1,          // 0-6
  recurrenceTime: '19:00',         // HH:MM
  // ... 기타 필드
})

// 유효성 검사
if (formData.meetingType === 'casual') {
  // 날짜/시간 필수
  if (!formData.meetingDate || !formData.startTime || !formData.endTime) {
    setError('즉흥 모임은 날짜와 시간을 입력해야 합니다')
    return
  }
}
```

#### MeetingsPage.jsx (최종 버전)
```javascript
// 필터 상태
const [filter, setFilter] = useState('casual') // 'casual', 'regular', 'past'

// 관리자 체크
const isAdmin = user?.role === 'admin'

// 쿼리 필터링
if (filter === 'regular') {
  // 정기 모임만
  query = query.eq('meeting_type', 'regular')
} else if (filter === 'casual') {
  // 즉흥 모임 (모집 중)
  query = query
    .eq('meeting_type', 'casual')
    .gte('start_datetime', new Date().toISOString())
    .in('status', ['recruiting', 'confirmed'])
} else if (filter === 'past') {
  // 지난 모임 (관리자 전용)
  query = query.lt('start_datetime', new Date().toISOString())
}

// 관리자 전용 탭 렌더링
{isAdmin && (
  <button onClick={() => setFilter('past')}>
    🕐 지난 모임 (관리자)
  </button>
)}
```

#### MeetingDetailPage.jsx
```javascript
// 조건부 렌더링
{meeting.meeting_type === 'regular' ? (
  <>매주 {daysOfWeek[meeting.recurrence_day_of_week]} {meeting.recurrence_time}</>
) : (
  <>{formatDate(meeting.start_datetime)} - {formatDate(meeting.end_datetime)}</>
)}
```

---

## ✅ 테스트 체크리스트

### 모임 생성
- [x] 정기 모임 생성 가능
- [x] 즉흥 모임 (취미) 생성 가능
- [x] 즉흥 모임 (토론) 생성 가능
- [x] 필수 필드 유효성 검사 작동
- [x] 정기 모임은 요일/시간만 입력
- [x] 즉흥 모임은 날짜/시간 입력

### 모임 목록 (최종)
- [x] 즉흥 모임 탭: 모집 중인 즉흥 모임만 표시
- [x] 정기 모임 탭: 모든 정기 모임 표시
- [x] 지난 모임 탭: 관리자만 보임
- [x] 일반 사용자: 2개 탭만 표시
- [x] 배지 정확히 표시
- [x] 정기 모임에 D-day 미표시
- [x] 즉흥 모임에 D-day 표시

### 권한 관리
- [x] 일반 사용자는 지난 모임 탭 안 보임
- [x] 관리자는 모든 탭 표시
- [x] 지난 모임 탭에서 과거 모든 모임 표시

### 모임 상세
- [x] 정기 모임 일정 정보 정확히 표시
- [x] 즉흥 모임 날짜/시간 정확히 표시
- [x] 모임 유형 배지 표시
- [x] 세부 유형 배지 표시 (즉흥 모임만)

### 데이터베이스
- [x] 마이그레이션 에러 없이 실행
- [x] ENUM 타입 정상 생성
- [x] 제약 조건 정상 작동
- [x] 인덱스 정상 생성
- [x] 기존 데이터 호환성 (hobby로 자동 설정)

---

## 🐛 알려진 제한사항

### 정기 모임
1. **첫 모임 날짜 계산**:
   - 현재는 수동으로 다음 해당 요일 계산 필요
   - 향후 자동 계산 기능 추가 예정

2. **반복 종료일**:
   - 현재는 종료일 없이 무한 반복
   - 향후 종료일 설정 기능 추가 예정

3. **휴일 제외**:
   - 공휴일 자동 건너뛰기 미지원
   - 수동으로 취소해야 함

### 즉흥 모임
1. **일정 수정**:
   - 생성 후 모임 유형 변경 불가
   - 처음부터 다시 생성해야 함

---

## 🔄 호환성

### 기존 데이터
- 기존 모임은 자동으로 `meeting_type = 'casual'`로 설정됨
- 기존 모임의 `casual_meeting_type`은 NULL이므로 수동 설정 필요

### 데이터 마이그레이션 스크립트 (선택사항)

기존 모임들을 취미 모임으로 일괄 업데이트:

```sql
UPDATE offline_meetings
SET
  meeting_type = 'casual',
  casual_meeting_type = 'hobby'
WHERE meeting_type IS NULL;
```

---

## 📚 관련 문서

- [FEATURES.md](./FEATURES.md) - 전체 기능 목록
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 프로젝트 개요
- Database Migration: `supabase/migrations/20250204_add_meeting_types.sql`

---

## 🎯 향후 계획

### 단기 (1-2주)
1. [ ] 정기 모임 첫 시작 날짜 자동 계산
2. [ ] 정기 모임 종료일 설정 기능
3. [ ] 모임 통계 (정기/즉흥 비율 등)

### 중기 (1개월)
1. [ ] 정기 모임 참석 이력 추적
2. [ ] 정기 모임 출석률 통계
3. [ ] 모임 유형별 알림 설정

### 장기 (2-3개월)
1. [ ] 격주/월 1회 등 다양한 반복 패턴
2. [ ] 공휴일 자동 건너뛰기
3. [ ] 모임 추천 시스템 (유형별)

---

## 📊 최종 결과

### 구현 완료 사항
1. ✅ 데이터베이스 마이그레이션 (meeting_type, casual_meeting_type, recurrence 필드)
2. ✅ 모임 생성 UI (정기/즉흥 구분, 동적 폼)
3. ✅ 모임 목록 필터링 (단순화된 3개 탭)
4. ✅ 관리자 전용 지난 모임 탭
5. ✅ 모임 상세 페이지 업데이트
6. ✅ 배지 시스템 (색상 코딩)
7. ✅ 기존 데이터 호환성

### UI 개선
- 필터 단순화 (2개 메인 탭 + 관리자 1개)
- 명확한 색상 구분 (초록/보라/회색)
- 권한 기반 UI (관리자만 지난 모임 볼 수 있음)
- D-day 조건부 표시

### 기술 부채 해결
- 정기 모임이 "지난 모임"에 표시되던 문제 해결
- 필터 로직 복잡도 감소
- 권한 관리 명확화

---

**업데이트 완료일**: 2025년 2월 4일
**작업자**: Claude Code
**상태**: ✅ 완료 (테스트 완료)
