# 정기 모임 자동 생성 시스템 가이드

## 개요

정기 모임을 템플릿으로 등록하면 **매주 자동으로** 새로운 모임이 생성됩니다. 참가자들은 **매주 새롭게 신청**해야 하며, 이전 주차의 참가 여부와 관계없이 독립적으로 운영됩니다.

## 주요 특징

### 1. 템플릿 기반 시스템
- 정기 모임을 만들면 **템플릿**으로 저장됩니다
- 템플릿에는 장소, 시간, 설명 등 모든 정보가 포함됩니다
- 템플릿 자체는 모임 목록에 표시되지 않습니다

### 2. 자동 생성
- **매주 월요일 00:00 (KST)** 에 다음 주 모임이 자동 생성됩니다
- 첫 주차 모임은 템플릿 생성 시 즉시 생성됩니다
- 각 주차마다 독립적인 모임 인스턴스가 생성됩니다

### 3. 독립적인 참가 신청
- 참가자는 **매주 새롭게 신청**해야 합니다
- 이전 주에 참가했어도 다음 주는 자동으로 신청되지 않습니다
- 각 주차마다 참가 인원이 초기화됩니다

### 4. 주차 관리
- 각 모임은 몇 번째 주차인지 표시됩니다 (1주차, 2주차, ...)
- 주차별로 독립적으로 관리됩니다
- 과거 주차 모임도 기록으로 남습니다

## 사용 방법

### 1. 정기 모임 템플릿 생성

1. **모임 만들기** 버튼 클릭
2. **모임 유형**: "📅 정기 모임" 선택
3. 필수 정보 입력:
   - 장소 (매주 동일한 장소)
   - 모임장 소개
   - 모임 상세 설명
   - 요일 선택 (예: 매주 수요일)
   - 시간 선택 (예: 19:00)
   - 최대 인원
   - 목적 (커피/술)
4. **모임 만들기** 클릭

### 2. 첫 주차 모임 자동 생성

템플릿을 만들면:
- **1주차 모임이 자동으로 생성**됩니다
- 생성 직후 1주차 모임 페이지로 이동합니다
- 모임장은 자동으로 1주차 모임에 참가 등록됩니다

### 3. 참가자 신청

참가자들은:
- 모임 목록에서 원하는 주차의 모임을 클릭
- "모임 참가하기" 버튼으로 신청
- 매주 새롭게 신청해야 합니다

### 4. 다음 주 모임 자동 생성

- 매주 월요일 00:00에 다음 주 모임이 자동 생성됩니다
- 자동 생성 시 모든 사용자에게 알림이 전송됩니다
- 모임장은 자동으로 참가 등록되지 **않습니다** (매주 신청 필요)

## 데이터베이스 마이그레이션

### 적용 방법

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/20250206_auto_generate_regular_meetings.sql` 내용 복사
3. 실행

### 주요 변경사항

#### 1. 새로운 컬럼
```sql
-- offline_meetings 테이블에 추가
is_template BOOLEAN          -- 템플릿 여부
template_id UUID             -- 원본 템플릿 ID
week_number INTEGER          -- 주차 번호
generated_at TIMESTAMP       -- 생성 시각
```

#### 2. 주요 함수

**get_next_meeting_datetime(day_of_week, time, from_date)**
- 다음 모임 날짜/시간 계산
- 요일과 시간을 기준으로 다음 발생 시점 반환

**generate_meeting_from_template(template_id, week_number)**
- 특정 템플릿에서 특정 주차의 모임 생성
- 중복 생성 방지
- 모임장 자동 참가 등록

**generate_next_week_meetings()**
- 모든 활성 템플릿의 다음 주 모임 생성
- 각 템플릿마다 다음 주차 계산
- 한 번에 여러 모임 생성

**auto_generate_weekly_meetings()**
- 매주 자동 실행되는 메인 함수
- 생성 결과 텍스트 반환

#### 3. 뷰 (View)

**active_regular_meetings**
- 활성화된 정기 모임 목록 (템플릿 제외)
- 참가자 수 포함

**regular_meeting_templates**
- 정기 모임 템플릿 목록
- 생성된 모임 수, 마지막 주차 번호 포함

## Edge Function 설정

### Edge Function 배포

```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 로그인
npx supabase login

# 프로젝트 연결
npx supabase link --project-ref YOUR_PROJECT_REF

# Edge Function 배포
npx supabase functions deploy generate-weekly-meetings
```

### Cron Job 설정 (선택 1: Supabase Cron)

Supabase에서 pg_cron 확장을 사용하여 설정:

```sql
-- Enable pg_cron extension (관리자 권한 필요)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly generation every Monday at 00:00 KST (15:00 UTC previous day)
SELECT cron.schedule(
    'generate-weekly-meetings',
    '0 15 * * 0',  -- Every Sunday 15:00 UTC = Monday 00:00 KST
    $$
    SELECT net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-weekly-meetings',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
    );
    $$
);
```

### Cron Job 설정 (선택 2: 외부 Cron 서비스)

**GitHub Actions 사용 예시:**

`.github/workflows/generate-weekly-meetings.yml`:
```yaml
name: Generate Weekly Meetings

on:
  schedule:
    - cron: '0 15 * * 0'  # Every Sunday 15:00 UTC = Monday 00:00 KST
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-weekly-meetings \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### 수동 실행 (테스트용)

```bash
# Edge Function 직접 호출
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-weekly-meetings \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# 또는 Supabase 함수 직접 호출
```

SQL에서 직접 호출:
```sql
SELECT auto_generate_weekly_meetings();
```

## 예시 시나리오

### 시나리오 1: 매주 수요일 독서 모임

1. **1월 8일 (월요일)**: 관리자가 정기 모임 템플릿 생성
   - 요일: 수요일
   - 시간: 19:00
   - 장소: 강남역 카페
   - 결과: **1월 10일 (수) 19:00** 1주차 모임 자동 생성

2. **1월 10일 (수)**: 1주차 모임 진행
   - 참가자: A, B, C (각자 신청)
   - 모임 종료

3. **1월 15일 (월) 00:00**: 2주차 모임 자동 생성
   - **1월 17일 (수) 19:00** 2주차 모임 생성
   - 참가자: 0명 (새로 신청 필요)
   - A, B, C는 다시 신청해야 함

4. **1월 17일 (수)**: 2주차 모임 진행
   - 참가자: A, D (B, C는 불참, D는 신규)

### 시나리오 2: 주차별 독립 운영

- **1주차**: 참가자 5명 → 모임 확정 → 진행 완료
- **2주차**: 참가자 0명에서 시작 → 3명 신청 → 진행
- **3주차**: 참가자 0명에서 시작 → 7명 신청 → 진행

각 주차는 완전히 독립적으로 운영됩니다.

## 관리자 기능

### 템플릿 관리 (추후 구현 예정)

관리자 페이지에서:
- 모든 정기 모임 템플릿 목록 조회
- 템플릿 수정/삭제
- 템플릿 비활성화 (자동 생성 중지)
- 수동으로 다음 주 모임 생성
- 생성 히스토리 확인

### 현재 가능한 관리

SQL 쿼리로 직접 관리:

```sql
-- 모든 템플릿 조회
SELECT * FROM regular_meeting_templates;

-- 특정 템플릿의 모든 주차 조회
SELECT * FROM offline_meetings
WHERE template_id = 'TEMPLATE_UUID'
ORDER BY week_number;

-- 템플릿 비활성화 (자동 생성 중지)
UPDATE offline_meetings
SET status = 'closed'
WHERE id = 'TEMPLATE_UUID' AND is_template = true;

-- 수동으로 다음 주 모임 생성
SELECT generate_next_week_meetings();
```

## 주의사항

### 1. 시간대
- 모든 시간은 **Asia/Seoul (KST)** 기준입니다
- 자동 생성은 **매주 월요일 00:00 KST**에 실행됩니다
- Edge Function Cron 설정 시 UTC 시간으로 변환 필요 (KST - 9시간)

### 2. 중복 생성 방지
- 같은 템플릿의 같은 주차는 한 번만 생성됩니다
- 이미 생성된 주차는 재생성되지 않습니다

### 3. 템플릿 수정
- 템플릿을 수정하면 **이미 생성된 모임은 변경되지 않습니다**
- 수정 내용은 **다음 주부터 적용**됩니다
- 이미 생성된 모임을 수정하려면 개별적으로 수정해야 합니다

### 4. 참가 관리
- 모임장도 매주 신청해야 합니다 (첫 주차 제외)
- 이전 주 참가 여부는 다음 주에 영향을 주지 않습니다
- 각 주차마다 참가 인원이 초기화됩니다

### 5. 알림
- 새 모임이 생성되면 모든 사용자에게 알림이 전송됩니다
- 정기 모임의 경우 "매주 수요일 19:00 정기 모임이 오픈되었습니다" 형태로 알림

## 문제 해결

### 자동 생성이 안 됨

1. **Edge Function 확인**
   ```bash
   npx supabase functions list
   ```

2. **Cron Job 상태 확인**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'generate-weekly-meetings';
   ```

3. **수동 실행 테스트**
   ```sql
   SELECT auto_generate_weekly_meetings();
   ```

### 템플릿이 목록에 표시됨

- `is_template = false` 필터가 제대로 적용되었는지 확인
- MeetingsPage.jsx가 최신 버전인지 확인

### 주차 번호가 잘못됨

```sql
-- 템플릿의 마지막 주차 확인
SELECT MAX(week_number) FROM offline_meetings
WHERE template_id = 'YOUR_TEMPLATE_ID';

-- 주차 번호 수동 수정 (필요시)
UPDATE offline_meetings
SET week_number = 정확한_주차_번호
WHERE id = '모임_ID';
```

## 다음 단계

### Phase 1: 현재 구현 완료
- ✅ 템플릿 기반 정기 모임 시스템
- ✅ 자동 생성 데이터베이스 함수
- ✅ Edge Function
- ✅ 주차별 독립 관리

### Phase 2: 관리자 UI (추후)
- 📋 관리자 페이지에서 템플릿 관리
- 📋 생성 히스토리 조회
- 📋 수동 생성 버튼
- 📋 템플릿 활성화/비활성화

### Phase 3: 고급 기능 (추후)
- 📋 참가자 출석 통계
- 📋 정기 참가자 관리
- 📋 자동 참가 신청 옵션
- 📋 모임 리마인더 알림

## 테스트 방법

### 1. 템플릿 생성 테스트
1. 정기 모임 생성
2. 1주차 모임이 자동 생성되는지 확인
3. 모임 목록에서 템플릿은 안 보이고 1주차만 보이는지 확인

### 2. 수동 생성 테스트
```sql
-- 2주차 수동 생성
SELECT generate_meeting_from_template('TEMPLATE_ID', 2);

-- 모임 목록 확인
SELECT * FROM offline_meetings
WHERE template_id = 'TEMPLATE_ID'
ORDER BY week_number;
```

### 3. 자동 생성 테스트
```sql
-- 다음 주 모임 생성 (모든 템플릿)
SELECT auto_generate_weekly_meetings();
```

### 4. 참가 신청 테스트
1. 1주차 모임 참가 신청
2. 2주차 모임에서 참가 여부 초기화 확인
3. 2주차 모임에 다시 신청

---

**작성일**: 2025년 2월 6일
**버전**: v2.8.0 (Regular Meeting Auto-generation)

**중요**:
1. 먼저 데이터베이스 마이그레이션을 적용하세요!
2. Edge Function을 배포하고 Cron Job을 설정하세요!
3. 매주 월요일 00:00에 자동으로 모임이 생성됩니다!
