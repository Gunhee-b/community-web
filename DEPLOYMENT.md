# 통찰방 커뮤니티 플랫폼 배포 가이드

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트 생성
2. 프로젝트 이름: `tongchalban-community`
3. 데이터베이스 비밀번호 설정 및 저장
4. 지역 선택 (추천: Northeast Asia - Seoul)

### 1.2 마이그레이션 실행
```bash
# Supabase CLI 설치 (Mac)
brew install supabase/tap/supabase

# 또는 npm으로 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# Supabase 프로젝트 연결
supabase login
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

또는 Supabase 웹 콘솔에서 직접 SQL 실행:
1. Supabase 대시보드 → SQL Editor
2. `supabase/migrations/` 폴더의 각 파일 내용을 순서대로 복사하여 실행

### 1.3 환경 변수 확인
Supabase 대시보드 → Settings → API에서 다음 값 확인:
- `Project URL`: `VITE_SUPABASE_URL`에 사용
- `anon public key`: `VITE_SUPABASE_ANON_KEY`에 사용

## 2. 로컬 개발 환경 설정

### 2.1 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 수정
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2.2 의존성 설치 및 개발 서버 실행
```bash
npm install
npm run dev
```

## 3. Vercel 배포

### 3.1 Vercel CLI로 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3.2 환경 변수 설정
Vercel 대시보드에서:
1. 프로젝트 선택 → Settings → Environment Variables
2. 다음 변수 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 3.3 자동 배포 설정
1. Vercel 대시보드 → Git 연동
2. GitHub 저장소 연결
3. main 브랜치 푸시 시 자동 배포

## 4. 초기 데이터 설정

### 4.1 관리자 계정 생성
1. 임의의 초대 코드 생성 (Supabase SQL Editor):
```sql
INSERT INTO invitation_codes (code, expires_at)
VALUES ('ADMIN1', NOW() + INTERVAL '7 days');
```

2. 회원가입 페이지에서 관리자 계정 생성

3. 역할을 admin으로 변경 (Supabase SQL Editor):
```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

### 4.2 첫 투표 기간 생성
관리자로 로그인 후:
1. 관리자 → 투표 관리
2. "새 투표 기간 생성" 버튼 클릭

## 5. 보안 체크리스트

- [ ] RLS 정책 활성화 확인
- [ ] Supabase anon key만 클라이언트에서 사용
- [ ] 환경 변수가 .gitignore에 포함되어 있는지 확인
- [ ] HTTPS 사용 (Vercel은 자동)
- [ ] Rate limiting 설정 (선택사항)

## 6. 모니터링 및 유지보수

### 6.1 Supabase 모니터링
- Dashboard → Database → Usage
- 데이터베이스 크기, 연결 수 확인

### 6.2 Vercel 모니터링
- Analytics 탭에서 트래픽 확인
- Logs 탭에서 에러 확인

### 6.3 정기 작업
- 매일: 만료된 초대 코드 정리
- 매주: 데이터베이스 백업
- 2주마다: 새 투표 기간 생성

## 7. 문제 해결

### 인증 오류
- 환경 변수가 올바른지 확인
- Supabase RLS 정책 확인

### 실시간 채팅 안 됨
- Supabase Realtime 활성화 확인
- WebSocket 연결 확인

### 배포 실패
- 빌드 로그 확인
- 환경 변수 설정 확인
