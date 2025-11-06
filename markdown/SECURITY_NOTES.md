# 보안 가이드

## RLS(Row Level Security) 비활성화

커스텀 인증 시스템을 사용하므로 Supabase의 RLS를 비활성화했습니다.
**중요**: 모든 권한 검증은 애플리케이션 레벨에서 수행해야 합니다.

## 애플리케이션 레벨 권한 검증

### 현재 구현된 권한 검증

#### 1. 라우트 보호 (src/routes.jsx)
```javascript
// 관리자 전용 라우트
<ProtectedRoute requireAdmin>
  <AdminLayout />
</ProtectedRoute>

// 로그인 사용자 전용 라우트
<ProtectedRoute>
  <MainLayout />
</ProtectedRoute>
```

#### 2. 관리자 함수 (Supabase RPC)
- `deactivate_user()`: 관리자만 실행 가능
- `activate_user()`: 관리자만 실행 가능
- `delete_user_permanently()`: 관리자만 실행 가능
- `admin_get_all_users_secure()`: 관리자만 실행 가능

#### 3. 프론트엔드 검증
- 관리자 페이지는 role='admin'인 사용자만 접근
- 비활성화된 계정은 자동 로그아웃

## 추가해야 할 보안 검증

### 1. 투표 관련
```javascript
// 투표 전 검증
- 사용자가 로그인했는지
- 투표 기간이 활성화되어 있는지
- 이미 투표했는지 (중복 투표 방지)
```

### 2. 게시글/댓글 작성
```javascript
// 작성 전 검증
- 사용자가 로그인했는지
- 사용자 계정이 활성화되어 있는지
```

### 3. 모임 관련
```javascript
// 모임 생성/참여 전 검증
- 사용자가 로그인했는지
- 모임 정원이 가득 찼는지
- 이미 참여했는지
```

## 보안 권장 사항

### 1. 민감한 작업은 RPC 함수로 처리
```sql
-- 예시: 투표 함수
CREATE FUNCTION cast_vote(p_user_id UUID, p_post_id UUID, ...)
RETURNS JSON AS $$
BEGIN
  -- 여기서 모든 권한 및 비즈니스 로직 검증
  -- 중복 투표 체크
  -- 투표 기간 체크
  -- 사용자 활성 상태 체크
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. 프론트엔드에서 사용자 상태 확인
```javascript
// 모든 중요한 작업 전에 확인
const currentUser = useAuthStore((state) => state.user)

if (!currentUser || !currentUser.is_active) {
  // 로그아웃 처리
  return
}

if (requireAdmin && currentUser.role !== 'admin') {
  // 권한 없음 처리
  return
}
```

### 3. API 키 보호
- `.env` 파일을 Git에 커밋하지 마세요
- `VITE_SUPABASE_ANON_KEY`는 공개 키이므로 괜찮습니다
- 서비스 역할 키는 절대 프론트엔드에 노출하지 마세요

## 현재 보안 상태

### ✅ 구현된 보안 기능
- [x] 관리자 전용 함수 (RPC)
- [x] 라우트 레벨 권한 검증
- [x] 비활성화된 계정 자동 로그아웃
- [x] 세션 만료 처리
- [x] 비밀번호 암호화 (bcrypt)

### ⚠️ 주의해야 할 사항
- [ ] RLS가 비활성화되어 있음
- [ ] 모든 권한 검증을 애플리케이션에서 수행해야 함
- [ ] SQL Injection 방지 (항상 파라미터화된 쿼리 사용)
- [ ] XSS 방지 (사용자 입력 검증)

### 🔄 개선 가능한 사항
- [ ] Rate limiting 구현
- [ ] IP 기반 차단
- [ ] 2FA (2단계 인증)
- [ ] 감사 로그 (audit log)
- [ ] CSRF 토큰

## 긴급 상황 대응

### 악의적인 사용자 차단
```sql
-- Supabase SQL Editor에서 실행
UPDATE users
SET is_active = false
WHERE id = '악의적인_사용자_UUID';
```

### 모든 세션 무효화
- 사용자에게 재로그인 요청
- 애플리케이션 배포 시 세션 저장소 키 변경

## 추가 리소스
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase 보안 가이드](https://supabase.com/docs/guides/auth)
