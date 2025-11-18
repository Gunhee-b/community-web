# 📋 Rezom Community - 앞으로 해야 할 일

**최종 업데이트**: 2025-11-17
**우선순위**: ⭐⭐⭐ (높음) → ⭐⭐ (중간) → ⭐ (낮음)

---

## 🎯 즉시 진행 가능한 작업

### 1. ⭐⭐⭐ 모바일 앱 OAuth 완성 (최우선)

**현재 상태**: 70% 완료
- ✅ Deep Link 설정 완료
- ✅ Edge Function 배포 완료
- ⏳ 실제 디바이스에서 테스트 필요

**필요한 작업**:
1. Kakao 개발자 콘솔에서 Redirect URI 수정
   - 현재 설정: `rezom://oauth/callback`
   - 확인 필요: Kakao 콘솔에 등록되어 있는지

2. Google OAuth 딥링크 처리 검증
   - 시스템 브라우저 → 앱 전환 테스트
   - iOS/Android 모두 테스트

3. 실제 디바이스 테스트
   - iOS 디바이스에서 전체 플로우 테스트
   - Android 디바이스에서 전체 플로우 테스트

**예상 소요 시간**: 2-3일
**우선순위**: ⭐⭐⭐
**담당 파일**:
- `app/services/auth.ts`
- `app/(auth)/login.tsx`
- `supabase/functions/kakao-auth/index.ts`

---

### 2. ⭐⭐⭐ 모바일 앱 API 연결

**현재 상태**: Mock 데이터 사용 중
**필요한 작업**:

#### 2.1 AuthService API 연결
```typescript
// services/auth.ts
- [ ] 실제 Supabase Auth 호출로 교체
- [ ] 토큰 관리 구현 (AsyncStorage/SecureStore)
- [ ] 세션 갱신 로직 추가
- [ ] 에러 처리 개선
```

#### 2.2 Meetings API 연결
```typescript
// services/api/meetings.ts
- [ ] getMeetings() - 모임 목록 불러오기
- [ ] getMeetingById() - 모임 상세 정보
- [ ] createMeeting() - 모임 생성
- [ ] joinMeeting() - 모임 참가
- [ ] leaveMeeting() - 모임 나가기
```

#### 2.3 Questions API 연결
```typescript
// services/api/questions.ts
- [ ] getTodayQuestion() - 오늘의 질문
- [ ] getPreviousQuestions() - 이전 질문 목록
- [ ] submitAnswer() - 답변 작성
- [ ] getPublicAnswers() - 공개 답변 목록
```

#### 2.4 Notifications API 연결
```typescript
// services/api/notifications.ts
- [ ] Supabase Realtime 구독 설정
- [ ] 알림 목록 불러오기
- [ ] 읽음 처리
- [ ] FCM 푸시 알림 연동 (선택사항)
```

**예상 소요 시간**: 5-7일
**우선순위**: ⭐⭐⭐

---

### 3. ⭐⭐ 모바일 앱 상세 화면 구현

#### 3.1 MeetingDetailScreen
```typescript
// app/meetings/[id].tsx
- [ ] 모임 상세 정보 표시
- [ ] 참여자 목록
- [ ] 참여/취소 버튼
- [ ] 모임 수정/삭제 (호스트만)
- [ ] 카카오톡 오픈채팅 링크
- [ ] 채팅 버튼 (ChatScreen으로 이동)
```

**Figma 참조**: `Figma_design/src/components/screens/MeetingDetailScreen.tsx`

#### 3.2 QuestionDetailScreen
```typescript
// app/questions/[id].tsx
- [ ] 질문 내용 표시
- [ ] 답변 작성 폼 (텍스트 + 이미지)
- [ ] 공개 답변 목록 (무한 스크롤)
- [ ] 댓글 작성/삭제
- [ ] 답변 수정/삭제 (본인만)
```

**Figma 참조**: `Figma_design/src/components/screens/QuestionDetailScreen.tsx`

**예상 소요 시간**: 3-4일
**우선순위**: ⭐⭐

---

### 4. ⭐⭐ 모바일 앱 실시간 채팅 구현

```typescript
// app/chat/[meetingId].tsx
- [ ] Supabase Realtime 구독
- [ ] 메시지 전송/수신
- [ ] 이미지 전송 (카메라/갤러리)
- [ ] 타이핑 인디케이터
- [ ] 읽음 표시
- [ ] 자동 스크롤
- [ ] Kakao 스타일 UI (웹과 동일)
```

**웹 참조**: `web/src/hooks/useMeetingChat.js`

**예상 소요 시간**: 4-5일
**우선순위**: ⭐⭐

---

### 5. ⭐ 관리자 대시보드 (모바일)

```typescript
// app/admin/dashboard.tsx
- [ ] 회원 관리 화면
- [ ] 모임 관리 화면
- [ ] 초대 코드 생성
- [ ] 투표 기간 관리
- [ ] 질문 관리
- [ ] 통계 대시보드
```

**웹 참조**:
- `web/src/pages/admin/AdminUsersPage.jsx`
- `web/src/pages/admin/AdminMeetingsPage.jsx`
- `web/src/pages/admin/AdminDashboardPage.jsx`

**예상 소요 시간**: 7-10일
**우선순위**: ⭐ (낮음 - 웹에서 관리 가능)

---

## 🔧 기술 부채 및 개선 사항

### 웹 플랫폼

#### 1. ⭐⭐ 이미지 업로드 UX 개선
**현재 상태**: 작동하지만 UX 개선 필요

**개선 사항**:
- [ ] 업로드 진행률 표시
- [ ] 드래그 앤 드롭 지원
- [ ] 이미지 프리뷰 개선
- [ ] 여러 이미지 동시 업로드
- [ ] 이미지 압축 옵션 추가

**우선순위**: ⭐⭐
**예상 소요 시간**: 2-3일

#### 2. ⭐ Service Worker 개선
**현재 상태**: 기본 캐싱 작동 중

**개선 사항**:
- [ ] 오프라인 페이지 추가
- [ ] 백그라운드 동기화
- [ ] 푸시 알림 (웹)
- [ ] 캐시 전략 최적화

**우선순위**: ⭐
**예상 소요 시간**: 3-4일

#### 3. ⭐⭐ 성능 최적화
```javascript
- [ ] React.lazy()로 코드 스플리팅
- [ ] 이미지 lazy loading 개선
- [ ] Lighthouse 점수 90+ 달성
- [ ] 번들 사이즈 최적화
- [ ] useCallback/useMemo 추가 적용
```

**우선순위**: ⭐⭐
**예상 소요 시간**: 2-3일

### 모바일 앱

#### 1. ⭐⭐⭐ 에러 처리 개선
```typescript
- [ ] 네트워크 에러 처리
- [ ] 오프라인 모드 UI
- [ ] 에러 바운더리 추가
- [ ] 사용자 친화적 에러 메시지
- [ ] 재시도 로직 구현
```

**우선순위**: ⭐⭐⭐
**예상 소요 시간**: 2-3일

#### 2. ⭐ 푸시 알림 설정
```typescript
- [ ] Expo Notifications 설정
- [ ] FCM 통합
- [ ] 알림 권한 요청
- [ ] 알림 탭 시 화면 이동
- [ ] 백그라운드 알림 처리
```

**우선순위**: ⭐
**예상 소요 시간**: 3-4일

---

## 📱 배포 준비

### iOS App Store

**필요한 작업**:
1. ⭐⭐⭐ App Store Connect 계정 설정
2. ⭐⭐⭐ App Icon 및 Splash Screen 준비
3. ⭐⭐⭐ 스크린샷 준비 (6.5", 5.5" 등)
4. ⭐⭐ 앱 설명 및 키워드 작성 (한국어/영어)
5. ⭐⭐ 개인정보처리방침 URL 준비
6. ⭐⭐ 이용약관 URL 준비
7. ⭐⭐⭐ TestFlight 베타 테스트
8. ⭐⭐⭐ Apple 심사 제출

**예상 소요 시간**: 5-7일 (심사 기간 제외)
**우선순위**: ⭐⭐⭐ (모바일 앱 완성 후)

### Google Play Store

**필요한 작업**:
1. ⭐⭐⭐ Google Play Console 계정 설정
2. ⭐⭐⭐ App Icon 및 Feature Graphic 준비
3. ⭐⭐⭐ 스크린샷 준비
4. ⭐⭐ 앱 설명 작성 (한국어/영어)
5. ⭐⭐ 개인정보처리방침 URL 준비
6. ⭐⭐⭐ 내부 테스트 → 알파 → 베타 테스트
7. ⭐⭐⭐ Google 심사 제출

**예상 소요 시간**: 3-5일 (심사 기간 제외)
**우선순위**: ⭐⭐⭐ (모바일 앱 완성 후)

---

## 🧪 테스트

### 단위 테스트
```typescript
- [ ] Auth 서비스 테스트
- [ ] API 호출 테스트
- [ ] Util 함수 테스트
- [ ] 컴포넌트 렌더링 테스트
```

**우선순위**: ⭐⭐
**예상 소요 시간**: 3-4일

### E2E 테스트
```typescript
- [ ] 로그인 플로우 테스트
- [ ] 모임 생성/참가 플로우
- [ ] 채팅 플로우
- [ ] 투표 플로우
```

**우선순위**: ⭐
**예상 소요 시간**: 4-5일

---

## 📊 분석 및 모니터링

### 웹 분석
```javascript
- [ ] Google Analytics 설정
- [ ] 사용자 행동 추적
- [ ] 이벤트 로깅
- [ ] 전환율 분석
```

**우선순위**: ⭐
**예상 소요 시간**: 1-2일

### 에러 모니터링
```javascript
- [ ] Sentry 연동 (웹)
- [ ] Sentry 연동 (모바일)
- [ ] 에러 알림 설정
- [ ] 성능 모니터링
```

**우선순위**: ⭐⭐
**예상 소요 시간**: 1-2일

---

## 🎨 UI/UX 개선

### 웹
```
- [ ] 다크모드 개선 (일부 컴포넌트)
- [ ] 반응형 디자인 개선 (태블릿)
- [ ] 접근성 개선 (스크린 리더)
- [ ] 애니메이션 추가 (페이지 전환)
```

**우선순위**: ⭐
**예상 소요 시간**: 3-4일

### 모바일
```
- [ ] 햅틱 피드백 추가
- [ ] 제스처 네비게이션 개선
- [ ] 스켈레톤 로딩 추가
- [ ] Pull-to-refresh 개선
```

**우선순위**: ⭐
**예상 소요 시간**: 2-3일

---

## 🔒 보안 개선

### 현재 보안 수준
- ✅ RLS (Row Level Security) 적용
- ✅ bcrypt 비밀번호 해싱
- ✅ JWT 토큰 기반 인증
- ✅ HTTPS 강제

### 추가 보안 조치
```
- [ ] Rate Limiting (API 호출 제한)
- [ ] CSRF 토큰 추가
- [ ] XSS 방어 강화
- [ ] SQL Injection 방어 점검
- [ ] 비밀번호 강도 정책 강화
- [ ] 2FA (Two-Factor Authentication) 추가
```

**우선순위**: ⭐⭐
**예상 소요 시간**: 3-5일

---

## 📚 문서화

### 개발자 문서
```
- [ ] API 문서 작성 (Swagger/OpenAPI)
- [ ] 컴포넌트 문서 (Storybook)
- [ ] 데이터베이스 스키마 문서
- [ ] 배포 가이드 업데이트
```

**우선순위**: ⭐
**예상 소요 시간**: 3-4일

### 사용자 가이드
```
- [ ] 사용자 메뉴얼 작성
- [ ] FAQ 페이지 추가
- [ ] 튜토리얼 영상 제작
- [ ] 도움말 섹션 추가
```

**우선순위**: ⭐
**예상 소요 시간**: 4-5일

---

## 🎯 우선순위별 작업 순서

### Phase 1: 모바일 앱 완성 (1-2주)
1. ⭐⭐⭐ OAuth 소셜 로그인 완료
2. ⭐⭐⭐ API 연결
3. ⭐⭐ 상세 화면 구현
4. ⭐⭐ 실시간 채팅 구현
5. ⭐⭐⭐ 에러 처리 개선

### Phase 2: 배포 준비 (1주)
1. ⭐⭐⭐ TestFlight 베타 테스트
2. ⭐⭐⭐ Google Play 내부 테스트
3. ⭐⭐ 스크린샷 및 설명 준비
4. ⭐⭐ 개인정보처리방침/이용약관

### Phase 3: 앱 스토어 출시 (1-2주)
1. ⭐⭐⭐ App Store 제출
2. ⭐⭐⭐ Google Play 제출
3. ⭐⭐ 심사 피드백 대응

### Phase 4: 개선 및 최적화 (지속적)
1. ⭐⭐ 웹 성능 최적화
2. ⭐⭐ 에러 모니터링 설정
3. ⭐ UI/UX 개선
4. ⭐ 문서화

---

## 📌 참고 사항

### 기술적 제약
- Expo SDK 버전: 호환성 유지 필요
- Supabase 무료 플랜: 용량 제한 주의
- Vercel 무료 플랜: 빌드 시간 제한

### 리소스
- Figma 디자인: `Figma_design/` 폴더
- 웹 참조 코드: `web/src/` 폴더
- 마이그레이션: `web/supabase/migrations/` 폴더

---

**마지막 업데이트**: 2025-11-17
**다음 리뷰**: 모바일 OAuth 완료 후
**문의**: 프로젝트 관리자
