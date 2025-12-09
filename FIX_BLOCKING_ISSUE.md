# 차단 기능 문제 해결 가이드

## ✅ 완료된 수정

### 1. 이용약관/개인정보처리방침 링크 수정 ✅
- `app/settings.tsx` 파일 수정 완료
- `Linking` API 사용하여 실제 URL 열도록 변경
- URL: https://rezom-support.vercel.app/terms
- URL: https://rezom-support.vercel.app/privacy

### 2. 차단 기능 디버깅 로그 추가 ✅
- `services/moderation.ts`에 상세 로그 추가
- 🔵 파란색 로그: 정상 진행
- ❌ 빨간색 로그: 에러 발생

---

## 🔍 차단 기능 문제 진단

차단 기능이 작동하지 않는 주요 원인:

### 원인 1: Supabase RPC 함수가 없음
SQL을 실행했지만 오류가 발생하여 함수가 생성되지 않았을 수 있습니다.

### 원인 2: user_blocks 테이블이 없음
테이블이 생성되지 않았거나 권한 문제가 있을 수 있습니다.

---

## 🛠️ 해결 방법

### 1단계: Supabase Dashboard 확인

#### A. 테이블 확인
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Database** > **Tables** 클릭
4. `user_blocks` 테이블이 있는지 확인

**테이블이 없다면:**
- ❌ SQL이 제대로 실행되지 않음
- ✅ 2단계로 진행

#### B. RPC 함수 확인
1. **Database** > **Functions** 클릭
2. 다음 함수들이 있는지 확인:
   - `block_user(uuid, uuid, text)`
   - `unblock_user(uuid, uuid)`
   - `get_blocked_user_ids(uuid)`

**함수가 없다면:**
- ❌ SQL이 제대로 실행되지 않음
- ✅ 2단계로 진행

---

### 2단계: Supabase SQL 재실행

#### 방법 A: 깨끗하게 다시 시작 (권장)

1. **Supabase Dashboard** > **SQL Editor** 열기

2. 먼저 기존 함수 완전 삭제:

```sql
-- 기존 함수 삭제
DROP FUNCTION IF EXISTS block_user CASCADE;
DROP FUNCTION IF EXISTS unblock_user CASCADE;
DROP FUNCTION IF EXISTS get_blocked_user_ids CASCADE;

-- 기존 테이블 삭제 (주의: 데이터가 모두 삭제됨)
DROP TABLE IF EXISTS user_blocks CASCADE;
```

3. **Run** 클릭하여 실행

4. `SUPABASE_BLOCK_SETUP.sql` 파일 내용 **전체** 복사

5. SQL Editor에 붙여넣기

6. **Run** 클릭하여 실행

7. 성공 메시지 확인:
```
사용자 차단 기능 설정이 완료되었습니다!
```

#### 방법 B: 함수만 재생성

기존 차단 데이터를 보존하려면:

```sql
-- 함수만 삭제하고 재생성
DROP FUNCTION IF EXISTS block_user CASCADE;
DROP FUNCTION IF EXISTS unblock_user CASCADE;
DROP FUNCTION IF EXISTS get_blocked_user_ids CASCADE;
```

그 다음 `SUPABASE_BLOCK_SETUP.sql`의 **6-9단계**만 실행 (RPC 함수 부분)

---

### 3단계: 앱에서 테스트

```bash
# 개발 서버 시작
npx expo start

# iOS 시뮬레이터 또는 실제 기기에서 실행
```

#### 테스트 절차:

1. **앱 실행 및 로그인**

2. **질문 > 답변 선택**

3. **차단 버튼 클릭**

4. **콘솔 로그 확인** (Metro 번들러 또는 브라우저 콘솔)

#### 정상 로그 예시:

```
🔵 Attempting to block user: {
  blocker_id: "uuid-123...",
  blocked_id: "uuid-456...",
  reason: null
}
🔵 Block user response: {
  data: { success: true },
  error: null
}
```

#### 에러 로그 예시:

```
❌ Error blocking user: {
  code: "42883",
  message: "function block_user does not exist"
}
```

**이 경우**: Supabase SQL을 다시 실행해야 함

---

### 4단계: 차단 목록 확인

1. **설정** > **차단 목록** 이동

2. 콘솔 로그 확인:

```
🔵 Fetching blocked users for user: uuid-123...
🔵 Blocked users response: {
  data: [...],
  error: null,
  count: 1
}
```

3. 차단한 사용자가 목록에 표시되는지 확인

---

## 📊 Supabase에서 직접 테스트

### 테이블 조회

```sql
-- 현재 사용자 확인
SELECT auth.uid();

-- 모든 차단 관계 조회
SELECT * FROM user_blocks;

-- 내가 차단한 사용자 조회
SELECT * FROM user_blocks WHERE blocker_id = auth.uid();
```

### RPC 함수 테스트

```sql
-- block_user 함수 테스트
SELECT block_user(
  'YOUR_USER_ID'::uuid,  -- 본인 ID
  'TARGET_USER_ID'::uuid, -- 차단할 사용자 ID
  'test'
);

-- 성공 시 결과:
-- {"success": true}

-- unblock_user 함수 테스트
SELECT unblock_user(
  'YOUR_USER_ID'::uuid,
  'TARGET_USER_ID'::uuid
);
```

---

## ❓ 자주 발생하는 오류

### 오류 1: "function block_user does not exist"

**원인**: RPC 함수가 생성되지 않음

**해결**:
```sql
-- SQL Editor에서 실행
DROP FUNCTION IF EXISTS block_user CASCADE;

-- 그 다음 SUPABASE_BLOCK_SETUP.sql의 block_user 함수 부분 재실행
```

### 오류 2: "permission denied for table user_blocks"

**원인**: RLS 정책 오류

**해결**:
```sql
-- RLS 정책 재설정
DROP POLICY IF EXISTS "Users can view own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can insert own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete own blocks" ON user_blocks;

-- 그 다음 SUPABASE_BLOCK_SETUP.sql의 5단계 재실행
```

### 오류 3: "relation user_blocks does not exist"

**원인**: 테이블이 생성되지 않음

**해결**:
```sql
-- SUPABASE_BLOCK_SETUP.sql 전체 재실행
```

---

## ✅ 최종 체크리스트

차단 기능 정상 작동 확인:

- [ ] Supabase에 `user_blocks` 테이블 존재
- [ ] Supabase에 `block_user` 함수 존재 (Functions 탭)
- [ ] Supabase에 `unblock_user` 함수 존재
- [ ] 앱에서 차단 버튼 클릭 시 에러 없음
- [ ] 콘솔 로그에 "🔵 Block user response: {data: {success: true}}" 표시
- [ ] 설정 > 차단 목록에 차단한 사용자 표시
- [ ] 차단 해제 기능 작동

이용약관/개인정보처리방침:

- [ ] 설정 > 이용약관 클릭 시 브라우저 열림
- [ ] 설정 > 개인정보처리방침 클릭 시 브라우저 열림
- [ ] URL이 정상적으로 로드됨

---

## 🆘 여전히 문제가 있다면

### 1. 로그 확인
```bash
# Metro 번들러 로그 확인
npx expo start

# 차단 버튼 클릭 후 콘솔에 표시되는 에러 메시지 확인
```

### 2. Supabase 로그 확인
1. Supabase Dashboard
2. **Logs** > **Postgres Logs**
3. 최근 에러 확인

### 3. RPC 함수 반환값 확인
```sql
-- SQL Editor에서 직접 실행
SELECT block_user(
  auth.uid(),
  'TARGET_USER_ID'::uuid,
  null
);

-- 반환값이 {"success": true}인지 확인
```

---

## 📝 다음 단계

문제 해결 후:

1. **로컬 테스트 완료**
   - 차단 기능 정상 작동 확인
   - 이용약관/개인정보처리방침 링크 작동 확인

2. **Xcode Archive**
   - 문제가 모두 해결되면 Xcode에서 Archive 진행

3. **App Store 제출**
   - Archive 업로드 후 심사 제출

---

**작성일**: 2025-11-27
**목적**: 차단 기능 문제 해결 및 설정 화면 수정
