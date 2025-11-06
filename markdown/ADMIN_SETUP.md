# 관리자 기능 설정 가이드

통찰방 커뮤니티 플랫폼의 관리자 권한 및 회원 관리 기능 설정 가이드입니다.

## 목차

1. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
2. [첫 관리자 계정 생성](#첫-관리자-계정-생성)
3. [관리자 기능](#관리자-기능)
4. [보안 정책](#보안-정책)

## 데이터베이스 마이그레이션

관리자 기능을 사용하기 위해 Supabase에 다음 마이그레이션을 실행해야 합니다.

### 1. 관리자 권한 및 RLS 정책 설정

`supabase/migrations/20250116_admin_user_management.sql` 파일을 Supabase SQL Editor에서 실행합니다.

이 마이그레이션은 다음을 수행합니다:
- Row Level Security (RLS) 정책 설정
- 관리자 전용 함수 생성:
  - `is_admin()`: 현재 사용자가 관리자인지 확인
  - `deactivate_user(user_id)`: 회원 비활성화
  - `activate_user(user_id)`: 회원 활성화
  - `delete_user_permanently(user_id)`: 회원 영구 삭제

### 2. 로그인 함수 업데이트

`supabase/migrations/20250116_update_login_function.sql` 파일을 Supabase SQL Editor에서 실행합니다.

이 마이그레이션은 로그인 시 `is_active` 상태를 체크하도록 업데이트합니다.

## 첫 관리자 계정 생성

데이터베이스에서 직접 사용자의 role을 'admin'으로 설정해야 합니다.

### Supabase SQL Editor에서 실행:

```sql
-- 특정 사용자를 관리자로 설정
UPDATE users
SET role = 'admin'
WHERE username = '당신의_아이디';

-- 확인
SELECT id, username, role, is_active
FROM users
WHERE username = '당신의_아이디';
```

또는 특정 조건으로 첫 번째 사용자를 관리자로 설정:

```sql
-- 가입일이 가장 빠른 사용자를 관리자로 설정
UPDATE users
SET role = 'admin'
WHERE id = (
  SELECT id
  FROM users
  ORDER BY created_at ASC
  LIMIT 1
);
```

## 관리자 기능

### 회원 관리 페이지

관리자는 `/admin/users` 페이지에서 다음 작업을 수행할 수 있습니다:

#### 1. 회원 비활성화/활성화
- **비활성화**: 회원의 로그인을 차단합니다
- **활성화**: 비활성화된 회원을 다시 활성화합니다
- 관리자는 자신의 계정을 비활성화할 수 없습니다

#### 2. 회원 삭제 (영구 삭제)
- 회원의 모든 데이터를 영구적으로 삭제합니다
- 삭제 전 확인 모달이 표시됩니다
- **주의**: 이 작업은 되돌릴 수 없습니다
- 관리자는 자신의 계정을 삭제할 수 없습니다

### 권한 체크

다음과 같은 보안 체크가 자동으로 수행됩니다:

1. **라우트 보호**: `/admin` 경로는 `role = 'admin'`인 사용자만 접근 가능
2. **활성 상태 확인**: `is_active = false`인 사용자는 자동으로 로그아웃
3. **로그인 차단**: 비활성화된 계정은 로그인이 불가능
4. **자기 보호**: 관리자는 자신의 계정을 비활성화하거나 삭제할 수 없음

## 보안 정책

### Row Level Security (RLS)

모든 users 테이블 작업에 RLS가 적용됩니다:

1. **SELECT**:
   - 사용자는 자신의 프로필만 조회 가능
   - 관리자는 모든 사용자 조회 가능

2. **UPDATE**:
   - 사용자는 자신의 프로필만 수정 가능
   - 관리자는 모든 사용자의 프로필 수정 가능

3. **DELETE**:
   - 관리자만 사용자 삭제 가능

### 데이터베이스 함수 보안

모든 관리자 함수는 `SECURITY DEFINER`로 설정되어:
- 함수 내에서 권한 체크를 수행
- 관리자가 아닌 경우 예외 발생
- 자기 자신에 대한 위험한 작업 방지

## 사용 예시

### 관리자로 로그인
```
1. 관리자 계정으로 로그인
2. 상단 네비게이션에서 "관리자" 메뉴 클릭
3. "회원 관리" 페이지 접속
```

### 회원 비활성화
```
1. 회원 관리 페이지에서 대상 회원 찾기
2. "비활성화" 버튼 클릭
3. 회원 상태가 "비활성"으로 변경
4. 해당 회원은 즉시 로그아웃되며 재로그인 불가
```

### 회원 삭제
```
1. 회원 관리 페이지에서 대상 회원 찾기
2. "삭제" 버튼 클릭
3. 확인 모달에서 "삭제" 버튼 클릭
4. 회원 데이터가 영구 삭제됨
```

## 문제 해결

### 관리자 페이지에 접근할 수 없는 경우

1. 사용자의 role이 'admin'으로 설정되어 있는지 확인:
```sql
SELECT id, username, role, is_active
FROM users
WHERE username = '당신의_아이디';
```

2. is_active가 true인지 확인:
```sql
UPDATE users
SET is_active = true
WHERE username = '당신의_아이디';
```

### 함수 실행 오류

마이그레이션이 올바르게 실행되었는지 확인:
```sql
-- 함수 존재 확인
SELECT proname
FROM pg_proc
WHERE proname IN ('is_admin', 'deactivate_user', 'activate_user', 'delete_user_permanently');
```

## 추가 정보

- users 테이블의 기본 role은 'member'입니다
- users 테이블의 기본 is_active 값은 true입니다
- 모든 관리자 작업은 감사 로그에 기록하는 것을 권장합니다 (추후 구현)

## 주의사항

1. 반드시 관리자 계정을 안전하게 관리하세요
2. 회원 삭제는 되돌릴 수 없으므로 신중하게 수행하세요
3. 비활성화 기능을 먼저 사용하여 임시 차단을 고려하세요
4. 정기적으로 관리자 권한을 검토하세요
