# 단계별 Supabase 설정 가이드

SQL 실행 시 오류가 발생하는 경우 이 가이드를 따라주세요.

---

## 문제 원인

`user_blocks` 테이블이 생성되지 않은 이유:
1. `users` 테이블 참조 오류 → Supabase는 `auth.users`를 사용
2. SQL 실행 중 오류 발생 → 나머지 코드가 실행되지 않음

---

## 해결 방법: 단계별 실행

### 1단계: 테이블만 먼저 생성

Supabase SQL Editor에서 **하나씩** 실행:

```sql
-- 1. 테이블 생성
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);
```

**Run 클릭**

✅ **성공 시**: "Success. No rows returned"
❌ **오류 시**: 아래로 스크롤하여 "오류 해결" 섹션 참고

---

### 2단계: 인덱스 생성

```sql
-- 2. 인덱스 생성
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
```

**Run 클릭**

---

### 3단계: RLS 설정

```sql
-- 3. RLS 활성화
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
CREATE POLICY "Users can view own blocks" ON user_blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert own blocks" ON user_blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON user_blocks
    FOR DELETE USING (auth.uid() = blocker_id);
```

**Run 클릭**

---

### 4단계: block_user 함수 생성

```sql
-- 5. block_user 함수
CREATE OR REPLACE FUNCTION block_user(
    p_blocker_id UUID,
    p_blocked_id UUID,
    p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_blocker_id = p_blocked_id THEN
        RETURN jsonb_build_object('success', false, 'error', '자기 자신을 차단할 수 없습니다');
    END IF;

    IF EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id) THEN
        RETURN jsonb_build_object('success', false, 'error', '이미 차단한 사용자입니다');
    END IF;

    INSERT INTO user_blocks (blocker_id, blocked_id, reason)
    VALUES (p_blocker_id, p_blocked_id, p_reason);

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

**Run 클릭**

✅ **성공 시**: Database > Functions에서 `block_user` 함수 확인

---

### 5단계: unblock_user 함수 생성

```sql
-- 6. unblock_user 함수
CREATE OR REPLACE FUNCTION unblock_user(
    p_blocker_id UUID,
    p_blocked_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM user_blocks
    WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', '차단되지 않은 사용자입니다');
    END IF;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

**Run 클릭**

---

### 6단계: 확인

#### A. 테이블 확인
1. Database > Tables
2. `user_blocks` 테이블이 보이는지 확인

#### B. 함수 확인
1. Database > Functions
2. `block_user` 함수가 보이는지 확인
3. `unblock_user` 함수가 보이는지 확인

---

## 오류 해결

### 오류 1: "relation auth.users does not exist"

**원인**: Supabase의 users 테이블 참조 방식이 다름

**해결**: 이미 위의 SQL에서 `auth.users`로 수정됨

---

### 오류 2: "duplicate key value violates unique constraint"

**원인**: 테이블이 이미 존재함

**해결**:
```sql
-- 기존 테이블 삭제 후 재생성
DROP TABLE IF EXISTS user_blocks CASCADE;

-- 그 다음 1단계부터 다시 실행
```

---

### 오류 3: "permission denied for schema public"

**원인**: 권한 문제

**해결**: Supabase Dashboard에서 프로젝트의 Database 권한 확인

---

## 빠른 테스트

모든 단계 완료 후:

```sql
-- 테이블 확인
SELECT * FROM user_blocks;

-- 함수 테스트 (본인 ID로 교체)
SELECT block_user(
    auth.uid(),
    'TARGET_USER_ID'::uuid,
    'test'
);
```

---

## 전체 한 번에 실행 (권장하지 않음)

문제가 계속 발생한다면 `SUPABASE_SIMPLE_SETUP.sql` 파일 전체를 복사하여 실행:

1. `SUPABASE_SIMPLE_SETUP.sql` 파일 열기
2. 전체 내용 복사
3. Supabase SQL Editor에 붙여넣기
4. Run 클릭
5. 오류 메시지 확인

---

## 다음 단계

설정 완료 후:

1. **앱 테스트**
   ```bash
   npx expo start
   ```

2. **차단 기능 테스트**
   - 질문 > 답변 > 차단 버튼 클릭
   - 콘솔 로그 확인

3. **성공 확인**
   - 설정 > 차단 목록에서 확인

---

**작성일**: 2025-11-27
**목적**: Supabase 설정 오류 해결
