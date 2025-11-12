# 사용자 삭제 및 복구 시스템 가이드

**작성일**: 2025-02-12
**버전**: v1.0.0
**대상**: 관리자

---

## 📋 목차

1. [개요](#개요)
2. [시스템 구조](#시스템-구조)
3. [관리자 페이지 사용법](#관리자-페이지-사용법)
4. [마이그레이션 적용](#마이그레이션-적용)
5. [데이터베이스 함수 상세](#데이터베이스-함수-상세)
6. [FAQ](#faq)

---

## 개요

기존의 `delete_user_permanently` 함수는 사용자를 영구 삭제하여 복구가 불가능했습니다.
새로운 시스템은 **Soft Delete + Archive** 방식을 사용하여 다음과 같은 장점을 제공합니다:

### ✅ 주요 기능

- **안전한 삭제**: 사용자 삭제 시 실제로 제거하지 않고 `deleted_at` 필드만 설정
- **완전한 백업**: 모든 사용자 데이터를 `deleted_users_archive` 테이블에 JSON으로 백업
- **즉시 복구**: 언제든지 원클릭으로 사용자 복구 가능
- **감사 추적**: 누가 언제 삭제/복구했는지 기록 보존
- **데이터 보호**: 실수로 인한 데이터 손실 방지

### ⚠️ 기존 시스템과의 차이점

| 항목 | 기존 (Permanent Delete) | 새 시스템 (Soft Delete + Archive) |
|------|------------------------|----------------------------------|
| 삭제 방식 | DB에서 완전 제거 | deleted_at 필드 설정 |
| 복구 가능 여부 | ❌ 불가능 | ✅ 즉시 복구 가능 |
| 데이터 백업 | ❌ 없음 | ✅ 완전한 JSON 백업 |
| 감사 추적 | ⚠️ 제한적 | ✅ 완전한 기록 |
| 사용자 로그인 | ❌ 계정 없음 | ❌ 차단됨 (복구 시 재개) |

---

## 시스템 구조

### 1. 데이터베이스 스키마

#### users 테이블 (수정됨)
```sql
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ADD COLUMN deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;
```

- `deleted_at`: NULL이면 활성 회원, 값이 있으면 삭제된 회원
- `deleted_by`: 삭제를 실행한 관리자의 ID

#### deleted_users_archive 테이블 (신규)
```sql
CREATE TABLE deleted_users_archive (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    user_data JSONB,               -- 사용자 전체 데이터
    invitation_codes_data JSONB,   -- 사용한 초대 코드
    posts_data JSONB,              -- 작성한 글
    votes_data JSONB,              -- 투표 기록
    comments_data JSONB,           -- 댓글
    meetings_hosted_data JSONB,    -- 주최한 모임
    meeting_participations_data JSONB, -- 참가한 모임
    chat_messages_data JSONB,      -- 채팅 메시지
    questions_data JSONB,          -- 질문 답변
    deleted_by UUID,
    deleted_at TIMESTAMP,
    deletion_reason TEXT,
    restored_at TIMESTAMP,
    restored_by UUID
);
```

### 2. 주요 함수

| 함수명 | 용도 | 설명 |
|--------|------|------|
| `soft_delete_user()` | 사용자 삭제 | 백업 + Soft Delete |
| `restore_deleted_user()` | 사용자 복구 | deleted_at을 NULL로 설정 |
| `get_deleted_users()` | 삭제된 회원 목록 | 관리자 페이지용 |
| `permanently_delete_user()` | 영구 삭제 | ⚠️ 복구 불가 (신중히 사용) |

---

## 관리자 페이지 사용법

### 1. 회원 삭제하기

1. **관리자 페이지 접속**
   - 메뉴 > 관리 > 회원 관리

2. **"활성 회원" 탭에서 삭제할 회원 찾기**
   - 회원 목록에서 삭제하려는 회원 확인

3. **"삭제" 버튼 클릭**
   - 각 회원 행의 "작업" 열에 있는 "삭제" 버튼 클릭

4. **삭제 확인 모달에서 정보 입력**
   ```
   ℹ️ Soft Delete (복구 가능)
   • 회원 데이터는 완전히 백업됩니다
   • 회원은 즉시 로그인할 수 없게 됩니다
   • 언제든지 "삭제된 회원" 탭에서 복구 가능합니다
   • 모든 관련 데이터가 보존됩니다

   삭제 사유 (선택사항):
   [                                    ]
   예: 커뮤니티 가이드라인 위반, 본인 요청 등
   ```

5. **"삭제" 버튼 클릭하여 확정**
   - 성공 메시지: "회원이 삭제되었습니다 (복구 가능)"

### 2. 회원 복구하기

1. **"삭제된 회원" 탭으로 이동**
   - 상단 탭에서 "삭제된 회원 (N)" 클릭

2. **삭제된 회원 목록 확인**
   - 닉네임, 역할, 삭제일, 삭제자, 삭제 사유 확인

3. **"복구" 버튼 클릭**
   - 복구하려는 회원의 "복구" 버튼 클릭

4. **확인 대화상자에서 "확인" 클릭**
   ```
   [사용자명] 회원을 복구하시겠습니까?
   [취소]  [확인]
   ```

5. **복구 완료**
   - 성공 메시지: "회원이 성공적으로 복구되었습니다"
   - 회원이 즉시 "활성 회원" 탭으로 이동
   - 회원은 다시 로그인 가능

### 3. 삭제된 회원 정보 확인

**"삭제된 회원" 탭 컬럼 설명:**

| 컬럼 | 설명 | 예시 |
|------|------|------|
| 닉네임 | 삭제된 회원의 닉네임 | `user123` |
| 역할 | 삭제 당시 역할 | `일반`, `모임장`, `관리자` |
| 삭제일 | 삭제된 날짜/시간 | `2025-02-12 14:30` |
| 삭제자 | 삭제를 실행한 관리자 | `admin_kim` |
| 삭제 사유 | 입력한 삭제 이유 | `커뮤니티 가이드라인 위반` |
| 작업 | 복구 버튼 | `[복구]` |

---

## 마이그레이션 적용

### 단계 1: Supabase Dashboard 접속

1. https://app.supabase.com 접속
2. 프로젝트 선택: `wghrshqnexgaojxrtiit`
3. 왼쪽 메뉴 > **SQL Editor** 클릭

### 단계 2: 마이그레이션 SQL 실행

1. **새 쿼리 생성**
   - "New query" 버튼 클릭

2. **SQL 복사 & 붙여넣기**
   - 파일: `web/supabase/migrations/20250212_user_soft_delete_and_archive.sql`
   - 전체 내용 복사하여 SQL Editor에 붙여넣기

3. **실행**
   - "Run" 버튼 클릭 (또는 Ctrl/Cmd + Enter)

4. **성공 확인**
   ```
   Success. No rows returned
   ```

### 단계 3: 검증

다음 쿼리를 실행하여 테이블과 함수가 정상적으로 생성되었는지 확인:

```sql
-- 테이블 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('deleted_at', 'deleted_by');

-- Archive 테이블 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'deleted_users_archive'
);

-- 함수 확인
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN (
  'soft_delete_user',
  'restore_deleted_user',
  'get_deleted_users',
  'permanently_delete_user'
);
```

예상 결과:
- `deleted_at`, `deleted_by` 컬럼이 존재
- `deleted_users_archive` 테이블이 존재
- 4개 함수 모두 존재

---

## 데이터베이스 함수 상세

### 1. soft_delete_user()

**용도**: 사용자를 Soft Delete 방식으로 삭제 (복구 가능)

**파라미터**:
```sql
soft_delete_user(
  p_user_id UUID,              -- 삭제할 사용자 ID
  p_admin_user_id UUID,        -- 관리자 ID
  p_deletion_reason TEXT       -- 삭제 사유 (선택)
)
```

**동작 과정**:
1. 관리자 권한 검증
2. 자기 자신 삭제 방지
3. 사용자 데이터 백업 (JSON 형식)
4. 관련 데이터 백업 (posts, votes, comments 등)
5. `deleted_users_archive` 테이블에 저장
6. `invitation_codes.used_by` NULL로 설정
7. `users.deleted_at` 타임스탬프 설정
8. `users.is_active` false로 설정

**반환값** (JSONB):
```json
{
  "success": true,
  "message": "User soft deleted and archived successfully",
  "archive_id": "uuid-here",
  "user_id": "uuid-here",
  "username": "user123"
}
```

**SQL 사용 예시**:
```sql
SELECT soft_delete_user(
  '4b5df6cc-8bbc-495c-9ab6-79fad3d88126',
  '20e10194-6916-4524-ac52-89e8e09d5a31',
  '커뮤니티 가이드라인 위반'
);
```

### 2. restore_deleted_user()

**용도**: 삭제된 사용자 복구

**파라미터**:
```sql
restore_deleted_user(
  p_user_id UUID,              -- 복구할 사용자 ID
  p_admin_user_id UUID         -- 관리자 ID
)
```

**동작 과정**:
1. 관리자 권한 검증
2. 사용자가 실제로 삭제되었는지 확인
3. `users.deleted_at` NULL로 설정
4. `users.deleted_by` NULL로 설정
5. `users.is_active` true로 설정
6. Archive 레코드에 복구 정보 기록

**반환값** (JSONB):
```json
{
  "success": true,
  "message": "User restored successfully",
  "user_id": "uuid-here",
  "username": "user123"
}
```

**SQL 사용 예시**:
```sql
SELECT restore_deleted_user(
  '4b5df6cc-8bbc-495c-9ab6-79fad3d88126',
  '20e10194-6916-4524-ac52-89e8e09d5a31'
);
```

### 3. get_deleted_users()

**용도**: 삭제된 회원 목록 조회 (관리자 페이지용)

**파라미터**:
```sql
get_deleted_users(
  p_admin_user_id UUID         -- 관리자 ID
)
```

**반환값** (TABLE):
```sql
user_id            UUID
username           TEXT
email              TEXT
role               user_role
deleted_at         TIMESTAMP
deleted_by_username TEXT
deletion_reason    TEXT
can_restore        BOOLEAN
```

**SQL 사용 예시**:
```sql
SELECT * FROM get_deleted_users('20e10194-6916-4524-ac52-89e8e09d5a31');
```

### 4. permanently_delete_user() ⚠️

**용도**: 사용자 영구 삭제 (복구 불가능)

**⚠️ 주의**: 이 함수는 신중하게 사용해야 합니다!

**파라미터**:
```sql
permanently_delete_user(
  p_user_id UUID,                        -- 삭제할 사용자 ID
  p_admin_user_id UUID,                  -- 관리자 ID
  p_confirm_permanent_deletion BOOLEAN   -- 반드시 true로 설정
)
```

**안전 장치**:
1. `p_confirm_permanent_deletion`이 `true`가 아니면 실행 거부
2. 사용자가 먼저 soft delete 되어 있어야 함
3. Archive 레코드는 보존 (감사 추적용)

**동작 과정**:
1. 확인 플래그 검증
2. 관리자 권한 검증
3. 사용자가 soft deleted 상태인지 확인
4. `invitation_codes.used_by` NULL로 설정
5. `users` 테이블에서 완전 삭제 (CASCADE로 관련 데이터도 삭제)
6. Archive 레코드는 유지

**반환값** (JSONB):
```json
{
  "success": true,
  "message": "User permanently deleted",
  "user_id": "uuid-here",
  "username": "user123",
  "warning": "This action cannot be undone. Archive record preserved."
}
```

**SQL 사용 예시**:
```sql
SELECT permanently_delete_user(
  '4b5df6cc-8bbc-495c-9ab6-79fad3d88126',
  '20e10194-6916-4524-ac52-89e8e09d5a31',
  true  -- 반드시 true로 설정
);
```

---

## FAQ

### Q1: 삭제된 회원이 로그인을 시도하면 어떻게 되나요?

**A**: RLS (Row Level Security) 정책이 `deleted_at IS NULL`인 회원만 보이도록 설정되어 있어, 삭제된 회원은 로그인이 차단됩니다.

```sql
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (
    auth.uid() = id
    AND deleted_at IS NULL  -- 삭제된 회원은 프로필 조회 불가
);
```

### Q2: 삭제된 회원의 게시글은 어떻게 되나요?

**A**:
- **Soft Delete**: 게시글은 그대로 유지되지만, CASCADE 설정에 따라 자동으로 숨김 처리될 수 있습니다.
- **Archive**: 모든 게시글이 JSON으로 백업되어 `deleted_users_archive.posts_data`에 저장됩니다.
- **복구 시**: 모든 데이터가 자동으로 복원됩니다.

### Q3: 삭제된 회원을 복구하면 과거 활동도 모두 복구되나요?

**A**: 네! Soft Delete 방식이기 때문에 실제로 데이터가 삭제되지 않았습니다. 복구 시:
- 투표 기록 ✅
- 작성한 글 ✅
- 댓글 ✅
- 모임 참가 기록 ✅
- 채팅 메시지 ✅
- 모든 것이 즉시 복원됩니다

### Q4: 영구 삭제는 언제 사용해야 하나요?

**A**: 다음과 같은 경우에만 사용을 권장합니다:
- ⚠️ 법적 요구 (GDPR "잊혀질 권리" 등)
- ⚠️ 스팸 계정 완전 제거
- ⚠️ 데이터베이스 정리 (6개월 이상 경과한 삭제 계정)

일반적인 회원 관리에는 **Soft Delete만으로 충분**합니다.

### Q5: Archive 데이터는 언제 삭제하나요?

**A**: Archive 데이터는 감사 추적 및 법적 증거용으로 **영구 보존**을 권장합니다.
필요 시 다음 쿼리로 수동 삭제 가능:

```sql
-- 6개월 이상 경과한 archive 레코드 삭제
DELETE FROM deleted_users_archive
WHERE deleted_at < NOW() - INTERVAL '6 months'
AND restored_at IS NULL;  -- 복구되지 않은 것만
```

### Q6: 실수로 잘못된 회원을 삭제했어요!

**A**: 걱정 마세요! 즉시 복구 가능합니다:
1. "삭제된 회원" 탭으로 이동
2. 해당 회원 찾기
3. "복구" 버튼 클릭
4. 모든 데이터가 즉시 복원됩니다

### Q7: 관리자 자신을 삭제할 수 있나요?

**A**: 아니요. 함수 내부에 안전 장치가 있어 자기 자신을 삭제하려고 하면 에러가 발생합니다:

```
EXCEPTION: Cannot delete your own account
```

### Q8: 삭제 사유는 필수인가요?

**A**: 아니요, 선택사항입니다. 하지만 다음과 같은 이유로 **입력을 권장**합니다:
- 나중에 복구 여부 판단 시 참고
- 감사 추적 및 투명성
- 팀원 간 의사소통

### Q9: 여러 명을 한 번에 삭제할 수 있나요?

**A**: 현재 UI는 개별 삭제만 지원합니다. 대량 삭제가 필요한 경우 SQL을 직접 사용:

```sql
-- 여러 명 일괄 삭제 (예시)
DO $$
DECLARE
  user_ids UUID[] := ARRAY[
    '4b5df6cc-8bbc-495c-9ab6-79fad3d88126',
    'another-uuid-here',
    'another-uuid-here'
  ];
  user_id UUID;
BEGIN
  FOREACH user_id IN ARRAY user_ids LOOP
    PERFORM soft_delete_user(
      user_id,
      '20e10194-6916-4524-ac52-89e8e09d5a31',  -- 관리자 ID
      '일괄 정리'
    );
  END LOOP;
END $$;
```

---

## 보안 고려사항

### 1. 권한 검증

모든 함수는 `SECURITY DEFINER`로 정의되어 있으며, 내부에서 관리자 권한을 검증합니다:

```sql
IF NOT FOUND OR v_admin.role != 'admin' THEN
  RAISE EXCEPTION 'Only admins can delete users';
END IF;
```

### 2. RLS (Row Level Security)

일반 사용자는 삭제된 회원을 조회할 수 없습니다:

```sql
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (
    auth.uid() = id
    AND deleted_at IS NULL
);
```

관리자만 모든 회원(삭제 포함)을 조회 가능:

```sql
CREATE POLICY "Admins can view all users including deleted"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    )
);
```

### 3. 감사 추적

모든 삭제/복구 작업은 다음 정보를 기록합니다:
- 누가 (deleted_by, restored_by)
- 언제 (deleted_at, restored_at)
- 왜 (deletion_reason)

---

## 문제 해결

### 문제 1: "User not found" 에러

**원인**: 해당 사용자 ID가 존재하지 않음

**해결**:
```sql
-- 사용자 존재 확인
SELECT id, username, deleted_at
FROM users
WHERE id = '<user_id>';
```

### 문제 2: "Only admins can delete users" 에러

**원인**: 현재 사용자가 관리자가 아님

**해결**:
```sql
-- 관리자 권한 확인
SELECT id, username, role, is_active
FROM users
WHERE id = '<current_user_id>';

-- 역할이 'admin'이고 is_active가 true여야 함
```

### 문제 3: "User is already deleted" 에러

**원인**: 이미 삭제된 회원을 다시 삭제하려 함

**해결**:
```sql
-- 삭제 상태 확인
SELECT username, deleted_at, deleted_by
FROM users
WHERE id = '<user_id>';

-- deleted_at이 NULL이 아니면 이미 삭제됨
```

### 문제 4: Archive 테이블이 너무 커요

**해결**: 오래된 레코드 정리

```sql
-- 1년 이상 경과하고 복구된 적 없는 archive 삭제
DELETE FROM deleted_users_archive
WHERE deleted_at < NOW() - INTERVAL '1 year'
AND restored_at IS NULL;
```

---

## 다음 단계

### 향후 개선 사항

1. **관리자 페이지 개선**
   - [ ] 일괄 삭제 UI
   - [ ] 삭제 사유 템플릿
   - [ ] 삭제 예약 기능

2. **자동화**
   - [ ] 비활성 회원 자동 삭제 (N일 미로그인)
   - [ ] Archive 자동 정리 (N개월 경과)

3. **알림**
   - [ ] 회원에게 삭제 예정 이메일 발송
   - [ ] 복구 시 환영 이메일

4. **통계**
   - [ ] 삭제 사유별 통계
   - [ ] 복구율 분석

---

## 참고 자료

- **마이그레이션 파일**: `web/supabase/migrations/20250212_user_soft_delete_and_archive.sql`
- **관리자 페이지**: `web/src/pages/admin/AdminUsersPage.jsx`
- **Supabase 문서**: https://supabase.com/docs
- **PostgreSQL JSONB**: https://www.postgresql.org/docs/current/datatype-json.html

---

**최종 업데이트**: 2025-02-12
**작성자**: Claude Code
**버전**: v1.0.0
