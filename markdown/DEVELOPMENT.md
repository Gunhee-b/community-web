# 개발 가이드

## 프로젝트 구조

```
tongchalban-community/
├── src/
│   ├── components/
│   │   ├── auth/          # 인증 관련 컴포넌트
│   │   ├── voting/        # 투표 관련 컴포넌트
│   │   ├── meetings/      # 모임 관련 컴포넌트
│   │   ├── admin/         # 관리자 컴포넌트
│   │   └── common/        # 공통 컴포넌트 (Button, Input, Card 등)
│   ├── pages/
│   │   ├── auth/          # 로그인, 회원가입 페이지
│   │   ├── voting/        # 투표 관련 페이지
│   │   ├── meetings/      # 모임 관련 페이지
│   │   └── admin/         # 관리자 페이지
│   ├── hooks/             # 커스텀 React 훅
│   ├── utils/             # 유틸리티 함수
│   │   ├── auth.js        # 인증 관련 함수
│   │   ├── date.js        # 날짜 포맷 함수
│   │   └── validation.js  # 입력 검증 함수
│   ├── lib/
│   │   └── supabase.js    # Supabase 클라이언트
│   ├── store/
│   │   └── authStore.js   # Zustand 상태 관리 (인증)
│   ├── routes.jsx         # 라우팅 설정
│   ├── App.jsx            # 앱 루트 컴포넌트
│   └── main.jsx           # 앱 진입점
├── supabase/
│   └── migrations/        # 데이터베이스 마이그레이션
└── public/                # 정적 파일

```

## 주요 기능 구현

### 1. 인증 시스템
- **파일**: `src/utils/auth.js`, `src/store/authStore.js`
- **기능**:
  - 초대 코드 기반 회원가입
  - 카카오 닉네임 중복 체크
  - bcrypt 비밀번호 해싱
  - 로그인/로그아웃

### 2. 투표 시스템
- **파일**: `src/pages/voting/`
- **기능**:
  - 2주 단위 투표 기간
  - 글 추천 및 투표
  - 중복 투표 허용
  - 실시간 투표 현황

### 3. 오프라인 모임
- **파일**: `src/pages/meetings/`
- **기능**:
  - 모임 생성 및 참가
  - 익명 채팅 (Supabase Realtime)
  - 자동 인원 관리
  - D-day 표시

### 4. 관리자 기능
- **파일**: `src/pages/admin/`
- **기능**:
  - 회원 관리
  - 투표 기간 관리
  - 초대 코드 생성
  - 통계 대시보드

## 코딩 가이드라인

### React 컴포넌트
```jsx
// 함수형 컴포넌트 사용
function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    // 부수 효과
  }, [dependencies])

  return (
    <div>
      {/* JSX */}
    </div>
  )
}

export default ComponentName
```

### 상태 관리
- 전역 상태: Zustand (`src/store/`)
- 로컬 상태: React useState
- 서버 상태: Supabase 쿼리

### 스타일링
- Tailwind CSS 클래스 사용
- 공통 컴포넌트 재사용 (Button, Input, Card)

### API 호출
```javascript
// Supabase 쿼리 예시
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)

if (error) {
  console.error('Error:', error)
  return
}

// 데이터 사용
```

## 새 기능 추가 방법

### 1. 새 페이지 추가
1. `src/pages/` 에 페이지 컴포넌트 생성
2. `src/routes.jsx` 에 라우트 추가
3. 필요시 네비게이션 링크 추가

### 2. 새 데이터베이스 테이블 추가
1. `supabase/migrations/` 에 새 마이그레이션 파일 생성
2. SQL로 테이블 정의
3. RLS 정책 추가
4. `supabase db push` 실행

### 3. 새 API 함수 추가
1. `src/utils/` 또는 적절한 위치에 함수 작성
2. 에러 처리 포함
3. JSDoc 주석 추가

## 디버깅 팁

### Supabase 쿼리 디버깅
```javascript
const { data, error } = await supabase
  .from('table')
  .select('*')

console.log('Data:', data)
console.log('Error:', error)
```

### React 상태 디버깅
```javascript
useEffect(() => {
  console.log('State changed:', state)
}, [state])
```

### 네트워크 요청 확인
브라우저 개발자 도구 → Network 탭에서 Supabase 요청 확인

## 성능 최적화

### 1. 이미지 최적화
- 적절한 크기로 리사이징
- WebP 포맷 사용

### 2. 쿼리 최적화
- 필요한 필드만 select
- 인덱스 활용
- 페이지네이션 구현

### 3. React 최적화
- React.memo() 사용 (필요시)
- useCallback, useMemo 활용
- 코드 스플리팅 (React.lazy)

## 테스트

### 수동 테스트 체크리스트
- [ ] 회원가입/로그인
- [ ] 글 추천 및 투표
- [ ] 모임 생성 및 참가
- [ ] 익명 채팅
- [ ] 관리자 기능

### 브라우저 호환성
- Chrome (최신)
- Safari (최신)
- Firefox (최신)

## 배포 전 체크리스트
- [ ] 환경 변수 설정
- [ ] 빌드 에러 없음
- [ ] Supabase 마이그레이션 완료
- [ ] RLS 정책 활성화
- [ ] 관리자 계정 생성
- [ ] 초기 투표 기간 생성
