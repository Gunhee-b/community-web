# 차단 기능 및 설정 문제 해결 가이드

## 문제 1: 사용자 차단 기능이 작동하지 않음

### 원인 진단

차단 기능이 작동하지 않는 이유:

1. **Supabase RPC 함수 미생성** ❌
   - `SUPABASE_BLOCK_SETUP.sql`을 실행했지만 오류가 있었을 가능성

2. **user_blocks 테이블 미생성** ❌
   - 테이블이 없거나 RLS 정책 오류

3. **RPC 함수 반환 타입 불일치** ❌
   - 기존 함수와 새 함수의 반환 타입 충돌

### 해결 방법

#### 1단계: Supabase Dashboard에서 확인

1. **Supabase Dashboard** 접속
2. **Database** > **Tables** 확인
   - `user_blocks` 테이블이 있는지 확인

3. **Database** > **Functions** 확인
   - `block_user(uuid, uuid, text)` 함수 존재 확인
   - `unblock_user(uuid, uuid)` 함수 존재 확인
   - `get_blocked_user_ids(uuid)` 함수 존재 확인

#### 2단계: SQL 재실행

만약 함수가 없다면 SQL을 다시 실행:

```sql
-- 먼저 기존 함수 완전 삭제
DROP FUNCTION IF EXISTS block_user(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS unblock_user(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_blocked_user_ids(UUID) CASCADE;

-- 테이블 삭제 (필요시)
-- DROP TABLE IF EXISTS user_blocks CASCADE;
```

그 다음 `SUPABASE_BLOCK_SETUP.sql` 전체 내용 재실행

#### 3단계: 앱에서 테스트

```bash
# 개발 서버 시작
npx expo start

# 로그 확인
# 차단 버튼 클릭 시 콘솔에 에러 메시지 확인
```

### 디버깅 팁

차단 기능 실행 시 에러가 나면:

1. **브라우저 콘솔** 또는 **Metro 번들러 로그**에서 에러 확인
2. 일반적인 에러:
   - `function block_user does not exist` → SQL 재실행 필요
   - `permission denied` → RLS 정책 확인
   - `null value in column` → 사용자 ID 확인

---

## 문제 2: 이용약관 및 개인정보처리방침 링크 안 보임

### 원인

`app/settings.tsx` 파일에서:
- `handleTermsPress()` 함수가 `console.log`만 실행
- `handlePrivacyPress()` 함수가 `console.log`만 실행
- TODO 주석으로 남겨져 있음

### 해결 방법

실제 URL을 열도록 수정 필요:

```typescript
import { Linking } from 'react-native';

const handleTermsPress = () => {
  Linking.openURL('https://your-terms-url.com');
};

const handlePrivacyPress = () => {
  Linking.openURL('https://your-privacy-url.com');
};
```

---

## 즉시 해결 방안

### 차단 기능 테스트

1. Supabase Dashboard에서 수동으로 테스트:

```sql
-- 현재 로그인한 사용자 ID 확인
SELECT auth.uid();

-- 테스트용 차단 추가
INSERT INTO user_blocks (blocker_id, blocked_id)
VALUES (
  'YOUR_USER_ID',  -- 본인 ID
  'TARGET_USER_ID'  -- 차단할 사용자 ID
);

-- 차단 목록 확인
SELECT * FROM user_blocks WHERE blocker_id = auth.uid();
```

2. RPC 함수 테스트:

```sql
-- block_user 함수 테스트
SELECT block_user(
  'YOUR_USER_ID'::uuid,
  'TARGET_USER_ID'::uuid,
  'test reason'
);

-- 결과가 {"success": true}이면 정상
```

### 이용약관/개인정보처리방침 임시 해결

URL이 없다면:

1. **간단한 웹페이지 생성** (GitHub Pages 또는 Notion)
2. **또는 앱 내 화면으로 표시** (별도 화면 생성)

---

## 체크리스트

차단 기능 작동 확인:

- [ ] Supabase에 `user_blocks` 테이블 존재
- [ ] Supabase에 `block_user` RPC 함수 존재
- [ ] Supabase에 `unblock_user` RPC 함수 존재
- [ ] 앱에서 차단 버튼 클릭 시 에러 없음
- [ ] 차단 후 차단 목록에 표시됨

설정 화면 확인:

- [ ] 이용약관 클릭 시 URL 열림
- [ ] 개인정보처리방침 클릭 시 URL 열림
- [ ] 또는 앱 내 화면으로 이동

---

## 다음 단계

이 가이드대로 문제를 해결한 후:

1. 로컬에서 테스트
2. 문제가 계속되면 에러 로그 확인
3. Supabase 로그 확인 (Dashboard > Logs)
