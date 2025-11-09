# 통찰방 앱 정식 출시 TODO 리스트

**목표**: iOS App Store 및 Android Google Play 정식 출시
**최종 목표일**: 2025년 11월 말
**현재 진행률**: 60%

---

## 📋 체크리스트 범례

- ✅ 완료
- 🔄 진행 중
- ⏳ 대기 중
- ❌ 미시작
- 🔴 긴급 (배포 블로커)
- 🟡 높음 (배포 전 필수)
- 🟢 중간 (배포 후 개선 가능)
- ⚪ 낮음 (선택 사항)

---

## 🚨 Phase 1: 긴급 해결 사항 (배포 블로커)

**기간**: 2025년 11월 5일 ~ 11월 7일 (3일)
**목표**: 앱 핵심 기능 완전히 작동

### 🔴 1-1. 이미지 업로드 400 에러 해결

**우선순위**: 🔴 최긴급
**담당**: 개발자
**예상 소요 시간**: 2-3시간

#### Step 1: Supabase Storage 설정
```sql
-- [ ] Dashboard → Storage → Create new bucket
--     Name: answer-images
--     Public: ✅ 체크
--     File size limit: 5MB
--     Allowed MIME types: image/jpeg, image/png, image/webp
```

#### Step 2: 데이터베이스 마이그레이션 실행
```sql
-- [ ] Supabase SQL Editor에서 순서대로 실행:

-- 1. 공개 답변 테이블 생성
-- File: supabase/migrations/20250129_add_public_answers.sql
-- [ ] 실행 완료

-- 2. 첫 번째 이미지 컬럼 추가
-- File: supabase/migrations/20250129_add_image_to_answers.sql
-- [ ] 실행 완료

-- 3. Storage RLS 정책 설정
-- File: supabase/migrations/20250129_setup_answer_images_storage.sql
-- [ ] 실행 완료

-- 4. 두 번째 이미지 컬럼 추가
-- File: supabase/migrations/20250129_add_second_image.sql
-- [ ] 실행 완료
```

#### Step 3: 데이터베이스 확인
```sql
-- [ ] 다음 쿼리 실행하여 컬럼 확인:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'question_answers'
AND column_name LIKE '%image%';

-- 예상 결과:
-- image_url     | text
-- image_url_2   | text
```

#### Step 4: Storage RLS 정책 확인
```sql
-- [ ] Supabase Dashboard → Storage → answer-images → Policies 확인
-- 필요한 정책:
--   1. SELECT: 모든 사용자 읽기 가능
--   2. INSERT: 인증된 사용자만 업로드 가능
--   3. UPDATE: 본인 파일만 수정 가능
--   4. DELETE: 본인 파일만 삭제 가능
```

#### Step 5: 웹에서 테스트
```bash
# [ ] 개발 서버 실행
npm run dev

# [ ] 브라우저에서 테스트:
# 1. 로그인
# 2. 오늘의 질문 → 공개 답변 작성
# 3. 이미지 1장 업로드 시도
# 4. 이미지 2장 업로드 시도
# 5. 답변 저장
# 6. 브라우저 콘솔에 에러 없는지 확인
```

#### Step 6: 모바일에서 테스트
```bash
# [ ] iOS 빌드 및 동기화
npm run build && npx cap sync ios

# [ ] Xcode 열기
open ios/App/App.xcworkspace

# [ ] iPhone 12 연결 및 실행

# [ ] 테스트:
# 1. 로그인
# 2. 오늘의 질문 → 공개 답변 작성
# 3. 카메라로 사진 촬영 후 업로드
# 4. 갤러리에서 사진 선택 후 업로드
# 5. 2장 모두 업로드 테스트
# 6. 답변 저장 성공 확인
```

**완료 조건**:
- ✅ 웹에서 이미지 1장 업로드 성공
- ✅ 웹에서 이미지 2장 업로드 성공
- ✅ 모바일에서 카메라 촬영 후 업로드 성공
- ✅ 모바일에서 갤러리 선택 후 업로드 성공
- ✅ 업로드된 이미지가 Supabase Storage에 저장됨
- ✅ 답변 목록에서 이미지 정상 표시

**참고 문서**: CURRENT_STATUS.md

---

### 🔴 1-2. Kakao 로그인 KOE006 에러 해결

**우선순위**: 🔴 긴급
**담당**: 개발자
**예상 소요 시간**: 30분

#### Step 1: Kakao Developers Console 설정
```
[ ] 1. https://developers.kakao.com 접속
[ ] 2. 내 애플리케이션 선택
[ ] 3. 제품 설정 → 카카오 로그인 클릭
[ ] 4. Redirect URI 섹션 확인
[ ] 5. 다음 URI들 추가 (없으면):
      ✅ http://localhost:3000/auth/callback
      ✅ http://localhost:5173/auth/callback
      ✅ http://127.0.0.1:3000/auth/callback
      ✅ https://[VERCEL-DOMAIN]/auth/callback
      ✅ ingk://auth/callback
[ ] 6. 저장 버튼 클릭
[ ] 7. 5-10분 대기 (Kakao 서버 반영 시간)
```

#### Step 2: 동의항목 설정 확인
```
[ ] 1. 제품 설정 → 카카오 로그인 → 동의항목
[ ] 2. 다음 항목이 "필수 동의"로 설정되어 있는지 확인:
      ✅ 이메일
      ✅ 프로필 정보 (닉네임, 프로필 사진)
[ ] 3. 저장
```

#### Step 3: 카카오 로그인 활성화 확인
```
[ ] 1. 제품 설정 → 카카오 로그인
[ ] 2. 카카오 로그인 활성화 상태가 ON인지 확인
```

#### Step 4: 테스트
```bash
# [ ] 브라우저 캐시 삭제 또는 시크릿 모드

# [ ] 웹에서 테스트:
# 1. http://localhost:3000/login 접속
# 2. "카카오로 계속하기" 버튼 클릭
# 3. 카카오 로그인 페이지 열리는지 확인
# 4. 로그인 후 앱으로 정상 복귀되는지 확인

# [ ] 모바일에서 테스트:
# 1. 앱 실행
# 2. 로그인 화면에서 "카카오로 계속하기" 클릭
# 3. 딥링크(ingk://)로 앱 복귀 확인
```

**완료 조건**:
- ✅ 웹에서 Kakao 로그인 성공
- ✅ 모바일에서 Kakao 로그인 성공
- ✅ 딥링크 복귀 정상 작동
- ✅ 사용자 프로필에 카카오 닉네임 표시

**참고 문서**: MOBILE_DEPLOYMENT_NOTES.md 문제 해결 섹션

---

### 🔴 1-3. iPhone 실기기 전체 기능 테스트

**우선순위**: 🔴 긴급
**담당**: QA + 개발자
**예상 소요 시간**: 2-3시간

#### 준비
```bash
# [ ] 최신 코드 빌드
npm run build && npx cap sync ios

# [ ] Xcode 열기
open ios/App/App.xcworkspace

# [ ] iPhone 12 USB 연결

# [ ] Xcode 상단 바에서 "iPhone 12 (실기기)" 선택

# [ ] 실행 버튼(▶) 클릭
```

#### 테스트 체크리스트

##### 인증 시스템
```
[ ] 회원가입 (초대 코드)
[ ] 로그인 (닉네임/비밀번호)
[ ] Google 소셜 로그인
[ ] Kakao 소셜 로그인 (1-2 완료 후)
[ ] 로그아웃
[ ] 프로필 조회
[ ] 닉네임 변경
```

##### 투표 시스템
```
[ ] 투표 기간 목록 조회
[ ] 글 추천 제출
[ ] 투표하기 (클릭)
[ ] 투표 취소 (재클릭)
[ ] 투표 현황 확인
[ ] 베스트 글 조회
```

##### 철학챗 (모임)
```
[ ] 모임 목록 조회 (비로그인)
[ ] 모임 상세 조회 (비로그인)
[ ] 로그인 후 모임 참가
[ ] 카카오톡 오픈채팅방 이동
[ ] 익명 채팅방 입장
[ ] 메시지 전송
[ ] 실시간 메시지 수신
[ ] 알림 수신 (다른 사용자가 메시지 보낼 때)
[ ] 모임 나가기
[ ] 모임 생성 (모임장/관리자)
[ ] 모임 수정 (모임장/관리자)
```

##### 오늘의 질문
```
[ ] 질문 목록 조회
[ ] 개인 답변 작성 (체크인)
[ ] 개인 답변 수정
[ ] 공개 답변 작성 (텍스트만)
[ ] 🔴 공개 답변 작성 (이미지 1장) ← 1-1 완료 후
[ ] 🔴 공개 답변 작성 (이미지 2장) ← 1-1 완료 후
[ ] 공개 답변 수정
[ ] 공개 답변 삭제
[ ] 댓글 작성
[ ] 댓글 삭제
```

##### 알림 시스템
```
[ ] 알림 벨 아이콘 확인
[ ] 미읽음 개수 배지 표시
[ ] 알림 클릭 시 해당 페이지 이동
[ ] 알림 개별 삭제
[ ] 알림 전체 삭제
```

##### 네이티브 기능
```
[ ] 카메라로 사진 촬영
[ ] 갤러리에서 사진 선택
[ ] 스플래시 스크린 표시 (앱 시작 시)
[ ] 상태바 스타일 (라이트 모드)
[ ] 앱 백그라운드 → 포그라운드 전환
[ ] 앱 종료 후 재실행 (로그인 상태 유지)
```

##### UI/UX
```
[ ] 모든 버튼 터치 영역 44px 이상
[ ] Safe Area Inset 적용 (노치 고려)
[ ] 햄버거 메뉴 작동
[ ] 하단 네비게이션 바 작동
[ ] 스크롤 부드럽게 작동
[ ] 로딩 인디케이터 표시
[ ] 에러 메시지 표시
```

**완료 조건**:
- ✅ 위 모든 항목 테스트 통과
- ✅ 크리티컬 버그 없음
- ✅ UI/UX 문제 없음

**발견된 버그는 즉시 수정**

---

## 🟡 Phase 2: 배포 전 필수 사항

**기간**: 2025년 11월 8일 ~ 11월 14일 (1주)
**목표**: 앱 배포 준비 완료

### 🟡 2-1. Android 에뮬레이터/실기기 테스트

**우선순위**: 🟡 높음
**담당**: QA + 개발자
**예상 소요 시간**: 2-3시간

#### 준비
```bash
# [ ] 최신 코드 빌드
npm run build && npx cap sync android

# [ ] Android Studio 열기
npx cap open android

# [ ] Pixel 6 API 34 에뮬레이터 실행
#     또는 실기기 USB 연결

# [ ] Android Studio에서 실행 버튼(▶) 클릭
```

#### 테스트 체크리스트
```
[ ] 1-3의 모든 테스트 항목 동일하게 진행
[ ] Android 특화 테스트:
      [ ] 백 버튼 (홈에서 클릭 시 앱 종료)
      [ ] 딥링크 테스트:
          adb shell am start -W -a android.intent.action.VIEW \
            -d "ingk://auth/callback?code=test" \
            com.tongchalban.community
      [ ] 권한 요청 팝업 (카메라, 갤러리)
      [ ] 알림 표시 (상태바)
```

**완료 조건**:
- ✅ iOS와 동일하게 모든 기능 작동
- ✅ Android 특화 테스트 통과
- ✅ 크리티컬 버그 없음

---

### 🟡 2-2. 앱 아이콘 및 스플래시 스크린 생성

**우선순위**: 🟡 높음
**담당**: 디자이너 + 개발자
**예상 소요 시간**: 2-3시간

#### 디자인 준비
```
[ ] 1. 앱 아이콘 디자인
      - 크기: 1024x1024 px
      - 형식: PNG (투명 배경 불가)
      - 파일명: icon.png
      - 저장 위치: assets/icon.png

      디자인 가이드:
      - 단순하고 명확한 디자인
      - 작은 크기에서도 식별 가능
      - 브랜드 컬러 사용
      - 텍스트는 최소화

[ ] 2. 스플래시 스크린 디자인 (선택)
      - 크기: 2732x2732 px
      - 형식: PNG
      - 파일명: splash.png
      - 저장 위치: assets/splash.png

      디자인 가이드:
      - 중앙 정렬
      - 단색 배경 권장
      - 로고 + 앱 이름
```

#### 자동 생성
```bash
# [ ] assets 폴더에 icon.png 배치 확인

# [ ] Capacitor Assets 플러그인 실행
npm run cap:assets

# 자동 생성되는 파일:
# - iOS: ios/App/App/Assets.xcassets/AppIcon.appiconset/
# - Android: android/app/src/main/res/mipmap-*/
# - PWA: public/pwa-192x192.png, public/pwa-512x512.png

# [ ] 생성 완료 확인
```

#### 확인
```bash
# [ ] iOS 시뮬레이터에서 확인
npm run build && npx cap sync ios
open ios/App/App.xcworkspace
# Run 후 홈 화면에 아이콘 확인

# [ ] Android 에뮬레이터에서 확인
npm run build && npx cap sync android
npx cap open android
# Run 후 홈 화면에 아이콘 확인
```

**완료 조건**:
- ✅ 앱 아이콘이 모든 크기에서 선명하게 표시
- ✅ iOS 홈 화면에 정상 표시
- ✅ Android 홈 화면에 정상 표시
- ✅ 스플래시 스크린 2초간 표시 후 자동 숨김

---

### 🟡 2-3. iOS App Store 스크린샷 촬영

**우선순위**: 🟡 높음
**담당**: QA + 디자이너
**예상 소요 시간**: 2시간

#### 필요한 스크린샷
```
[ ] iPhone 6.7" (1290x2796) - iPhone 14 Pro Max
      [ ] 1. 로그인 화면
      [ ] 2. 홈 화면 (모임 목록)
      [ ] 3. 오늘의 질문 목록
      [ ] 4. 공개 답변 상세 (이미지 포함)
      [ ] 5. 모임 채팅 화면

[ ] iPhone 6.5" (1242x2688) - iPhone 11 Pro Max
      (동일한 5장)

[ ] iPhone 5.5" (1242x2208) - iPhone 8 Plus
      (동일한 5장)
```

#### 촬영 방법
```
1. [ ] Xcode에서 적절한 시뮬레이터 선택
2. [ ] 앱 실행
3. [ ] 각 화면으로 이동
4. [ ] Cmd + S (스크린샷 저장)
5. [ ] ~/Desktop/Screenshots 폴더에 저장
6. [ ] 파일명 규칙:
      - 6.7_1_login.png
      - 6.5_2_home.png
      - 5.5_3_questions.png
      등등
```

**완료 조건**:
- ✅ 각 크기별로 최소 3장, 권장 5장 촬영
- ✅ 스크린샷이 선명하고 깔끔함
- ✅ 실제 콘텐츠 포함 (더미 데이터 아님)
- ✅ 개인정보 미포함 (테스트 계정 사용)

---

### 🟡 2-4. Android Google Play 스크린샷 촬영

**우선순위**: 🟡 높음
**담당**: QA + 디자이너
**예상 소요 시간**: 1-2시간

#### 필요한 스크린샷
```
[ ] Phone (최소 2장, 권장 5장)
      해상도: 자유 (일반적으로 1080x1920 이상)
      [ ] 1. 로그인 화면
      [ ] 2. 홈 화면
      [ ] 3. 투표 화면
      [ ] 4. 모임 상세
      [ ] 5. 채팅 화면

[ ] 7-inch Tablet (선택)
[ ] 10-inch Tablet (선택)
```

#### 촬영 방법
```
1. [ ] Android Studio에서 에뮬레이터 실행
2. [ ] 앱 실행
3. [ ] 각 화면으로 이동
4. [ ] 에뮬레이터 우측 메뉴 → Camera (📷) 클릭
5. [ ] ~/Desktop/Screenshots 폴더에 저장
```

**완료 조건**:
- ✅ 최소 2장, 권장 5장 촬영
- ✅ 스크린샷이 선명하고 깔끔함
- ✅ 실제 콘텐츠 포함

---

### 🟡 2-5. 개인정보 처리방침 페이지 작성

**우선순위**: 🟡 높음
**담당**: 개발자 + 법무 (선택)
**예상 소요 시간**: 2-3시간

#### 필요한 내용
```
[ ] 1. 서비스 개요
      - 앱 이름: 통찰방 (ING:K)
      - 제공자: [회사명/개인명]
      - 연락처: [이메일]

[ ] 2. 수집하는 개인정보 항목
      [ ] 필수 항목:
          - 닉네임
          - 비밀번호 (해싱됨)
      [ ] 선택 항목:
          - 이메일 (소셜 로그인 시)
          - 프로필 사진 (소셜 로그인 시)
      [ ] 자동 수집 항목:
          - IP 주소
          - 기기 정보 (OS 버전, 기기 모델)
          - 앱 사용 기록

[ ] 3. 개인정보 수집 및 이용 목적
      - 회원 가입 및 관리
      - 서비스 제공 및 개선
      - 통계 분석
      - 고객 지원

[ ] 4. 개인정보 보유 및 이용 기간
      - 회원 탈퇴 시까지
      - 또는 법령에 따른 보유 기간

[ ] 5. 개인정보 제3자 제공
      - 제공하지 않음 (또는 제공 시 명시)

[ ] 6. 개인정보 처리 위탁
      - Supabase (데이터베이스 호스팅)
      - Vercel (웹 호스팅)

[ ] 7. 사용자 권리
      - 개인정보 열람 요청
      - 개인정보 정정 요청
      - 개인정보 삭제 요청
      - 처리 정지 요청

[ ] 8. 개인정보 보호책임자
      - 이름: [담당자명]
      - 이메일: [이메일]
      - 전화: [전화번호] (선택)

[ ] 9. 개인정보 처리방침 변경
      - 변경 시 앱 내 공지
      - 시행일자 명시

[ ] 10. 문의처
      - 이메일: [이메일]
```

#### 작성 및 배포
```
[ ] 1. 개인정보 처리방침 HTML 페이지 작성
      - 파일: public/privacy-policy.html
      - 또는 별도 호스팅

[ ] 2. Vercel에 배포
      - URL: https://[YOUR-DOMAIN]/privacy-policy.html

[ ] 3. URL 복사 (App Store/Play Store 제출 시 필요)
```

**완료 조건**:
- ✅ 개인정보 처리방침 페이지 작성 완료
- ✅ 공개 URL 생성
- ✅ 모바일에서 정상 표시 확인

---

### 🟡 2-6. 지원 페이지 작성

**우선순위**: 🟡 중간
**담당**: 개발자
**예상 소요 시간**: 1시간

#### 필요한 내용
```
[ ] 1. 앱 소개
      - 통찰방이란?
      - 주요 기능 소개

[ ] 2. FAQ (자주 묻는 질문)
      [ ] Q: 초대 코드는 어디서 받나요?
      [ ] Q: 비밀번호를 잊어버렸어요
      [ ] Q: 모임에 참가하려면 어떻게 하나요?
      [ ] Q: 알림이 오지 않아요
      [ ] Q: 탈퇴하려면 어떻게 하나요?

[ ] 3. 문의하기
      - 이메일: [이메일]
      - 응답 시간: 평일 9-18시

[ ] 4. 버전 정보
      - 현재 버전: 1.0.0
      - 최신 업데이트 내역
```

#### 작성 및 배포
```
[ ] 1. 지원 페이지 HTML 작성
      - 파일: public/support.html

[ ] 2. Vercel에 배포
      - URL: https://[YOUR-DOMAIN]/support.html
```

**완료 조건**:
- ✅ 지원 페이지 작성 완료
- ✅ 공개 URL 생성

---

## 🟢 Phase 3: App Store 제출 준비 (iOS)

**기간**: 2025년 11월 15일 ~ 11월 21일 (1주)
**목표**: TestFlight 베타 테스트 시작

### 🟢 3-1. Apple Developer Program 가입

**우선순위**: 🟢 중간
**담당**: 프로젝트 매니저
**예상 소요 시간**: 1일 (심사 시간 포함)
**비용**: $99/year

#### 단계
```
[ ] 1. Apple ID로 https://developer.apple.com 접속
[ ] 2. "Enroll" 버튼 클릭
[ ] 3. 개인 또는 조직 선택
[ ] 4. 결제 정보 입력
[ ] 5. 신청서 제출
[ ] 6. 승인 대기 (24시간 이내)
[ ] 7. 승인 완료 이메일 확인
```

**완료 조건**:
- ✅ Apple Developer Program 승인 완료
- ✅ Apple Developer Console 접속 가능

---

### 🟢 3-2. App ID 및 Provisioning Profile 생성

**우선순위**: 🟢 중간
**담당**: 개발자
**예상 소요 시간**: 30분

#### App ID 생성
```
[ ] 1. https://developer.apple.com/account 접속
[ ] 2. Certificates, Identifiers & Profiles 클릭
[ ] 3. Identifiers → + 버튼
[ ] 4. App IDs 선택 → Continue
[ ] 5. App 선택 → Continue
[ ] 6. 정보 입력:
      - Description: Tongchalban Community
      - Bundle ID: Explicit
      - Bundle ID: com.tongchalban.community
[ ] 7. Capabilities 선택:
      ✅ Push Notifications
      ✅ Sign in with Apple (선택)
[ ] 8. Continue → Register
```

#### Distribution Certificate 생성
```
[ ] 1. Certificates → + 버튼
[ ] 2. iOS Distribution (App Store and Ad Hoc) 선택
[ ] 3. Continue
[ ] 4. Certificate Signing Request (CSR) 생성:
      - Mac에서 Keychain Access 열기
      - 인증서 지원 → 인증 기관에서 인증서 요청
      - 이메일 입력
      - "디스크에 저장됨" 선택
      - 저장
[ ] 5. CSR 파일 업로드
[ ] 6. Continue → Download
[ ] 7. 다운로드한 .cer 파일 더블 클릭 (Keychain에 설치)
```

#### Provisioning Profile 생성
```
[ ] 1. Profiles → + 버튼
[ ] 2. App Store 선택 → Continue
[ ] 3. App ID 선택: com.tongchalban.community
[ ] 4. Certificate 선택: 위에서 생성한 Distribution Certificate
[ ] 5. Profile Name: Tongchalban App Store
[ ] 6. Generate
[ ] 7. Download
[ ] 8. 다운로드한 .mobileprovision 파일 더블 클릭
```

**완료 조건**:
- ✅ App ID 생성 완료
- ✅ Distribution Certificate 생성 및 설치 완료
- ✅ Provisioning Profile 생성 및 설치 완료

---

### 🟢 3-3. Xcode 프로젝트 설정

**우선순위**: 🟢 중간
**담당**: 개발자
**예상 소요 시간**: 30분

#### Signing & Capabilities
```
[ ] 1. Xcode에서 프로젝트 열기:
      open ios/App/App.xcworkspace

[ ] 2. 프로젝트 네비게이터에서 "App" 클릭

[ ] 3. TARGETS → App 선택

[ ] 4. Signing & Capabilities 탭 클릭

[ ] 5. Team 선택:
      - Automatically manage signing 체크 해제
      - Team: [Your Apple Developer Team]
      - Provisioning Profile: Tongchalban App Store

[ ] 6. Bundle Identifier 확인:
      - com.tongchalban.community

[ ] 7. Version 설정:
      - Version: 1.0.0
      - Build: 1
```

#### Capabilities 추가
```
[ ] 1. + Capability 버튼 클릭

[ ] 2. 다음 추가:
      ✅ Push Notifications
      ✅ Background Modes (선택)
          - Remote notifications
```

**완료 조건**:
- ✅ Team 설정 완료
- ✅ Provisioning Profile 연결 완료
- ✅ Capabilities 추가 완료
- ✅ 빌드 에러 없음

---

### 🟢 3-4. App Store Connect 앱 등록

**우선순위**: 🟢 중간
**담당**: 프로젝트 매니저 + 개발자
**예상 소요 시간**: 1시간

#### 앱 등록
```
[ ] 1. https://appstoreconnect.apple.com 접속

[ ] 2. My Apps → + 버튼 → New App

[ ] 3. 정보 입력:
      - Platforms: iOS
      - Name: 통찰방
      - Primary Language: Korean
      - Bundle ID: com.tongchalban.community
      - SKU: tongchalban-ios-001
      - User Access: Full Access

[ ] 4. Create 클릭
```

#### 앱 정보 입력
```
[ ] 1. App Information
      [ ] Name: 통찰방
      [ ] Subtitle: 커뮤니티 투표 및 모임 플랫폼
      [ ] Privacy Policy URL: https://[YOUR-DOMAIN]/privacy-policy.html
      [ ] Category:
          - Primary: Social Networking
          - Secondary: Lifestyle
      [ ] Content Rights: 해당 없음

[ ] 2. Pricing and Availability
      [ ] Price: Free
      [ ] Availability: All countries (또는 선택)

[ ] 3. App Privacy
      [ ] Data Types:
          ✅ Contact Info (Email)
          ✅ User Content (Messages)
          ✅ Identifiers (User ID)
      [ ] Data Use:
          ✅ App Functionality
          ✅ Analytics
```

#### 버전 정보 입력
```
[ ] 1. Version 1.0 선택

[ ] 2. 정보 입력:
      [ ] What's New in This Version:
          "통찰방 첫 출시!
          - 커뮤니티 투표 시스템
          - 오프라인 모임 관리
          - 실시간 익명 채팅
          - 오늘의 질문"

      [ ] Promotional Text (선택):
          "250명 커뮤니티를 위한 투표 및 모임 플랫폼"

      [ ] Description:
          [상세한 앱 설명 작성 - 최대 4000자]

      [ ] Keywords:
          투표,모임,커뮤니티,채팅,철학

      [ ] Support URL:
          https://[YOUR-DOMAIN]/support.html

      [ ] Marketing URL (선택):
          https://[YOUR-DOMAIN]

[ ] 3. Screenshots 업로드
      [ ] 6.7" iPhone: 2-3의 촬영본 업로드
      [ ] 6.5" iPhone: 2-3의 촬영본 업로드
      [ ] 5.5" iPhone: 2-3의 촬영본 업로드

[ ] 4. Build 선택 (나중에 업로드 후)
      - 3-5에서 업로드한 빌드 선택

[ ] 5. App Review Information
      [ ] Contact Information:
          - First Name: [이름]
          - Last Name: [성]
          - Phone: [전화번호]
          - Email: [이메일]

      [ ] Demo Account (테스트용):
          - Username: test_reviewer
          - Password: [테스트 비밀번호]
          - 초대 코드: [유효한 코드]

      [ ] Notes (선택):
          "테스트 방법:
          1. 제공된 초대 코드로 회원가입
          2. 홈 화면에서 모임 목록 확인
          3. 투표 탭에서 투표 진행
          4. 질문 탭에서 답변 작성"

[ ] 6. Version Release
      [ ] Manually release this version
      (또는 Automatically release this version)

[ ] 7. Save
```

**완료 조건**:
- ✅ 앱 등록 완료
- ✅ 모든 정보 입력 완료
- ✅ 스크린샷 업로드 완료
- ✅ 심사 준비 완료 (빌드 업로드 대기)

---

### 🟢 3-5. Xcode Archive 및 업로드

**우선순위**: 🟢 중간
**담당**: 개발자
**예상 소요 시간**: 30분

#### Archive 생성
```
[ ] 1. Xcode 열기:
      open ios/App/App.xcworkspace

[ ] 2. 상단 바에서 "Any iOS Device (arm64)" 선택

[ ] 3. Product → Archive 클릭

[ ] 4. 빌드 대기 (약 5-10분)

[ ] 5. Archives 창이 자동으로 열림
```

#### TestFlight 업로드
```
[ ] 1. Archives 창에서 최신 Archive 선택

[ ] 2. Distribute App 버튼 클릭

[ ] 3. App Store Connect 선택 → Next

[ ] 4. Upload 선택 → Next

[ ] 5. 옵션 선택:
      ✅ Include bitcode: Yes (권장)
      ✅ Upload your app's symbols: Yes (권장)
      ✅ Manage Version and Build Number: Yes

[ ] 6. Automatically manage signing 선택 → Next

[ ] 7. Review 화면 확인 → Upload

[ ] 8. 업로드 대기 (약 5-10분)

[ ] 9. 성공 메시지 확인
```

#### TestFlight 처리 대기
```
[ ] 1. App Store Connect → TestFlight 탭

[ ] 2. 업로드한 빌드가 "Processing" 상태 확인

[ ] 3. 처리 완료 대기 (약 10-30분)

[ ] 4. 이메일로 "Build Processed" 알림 받음

[ ] 5. 빌드 상태가 "Ready to Submit" 또는 "Ready to Test"로 변경됨
```

**완료 조건**:
- ✅ Archive 생성 성공
- ✅ TestFlight 업로드 성공
- ✅ 빌드 처리 완료

---

### 🟢 3-6. TestFlight 내부 테스트

**우선순위**: 🟢 중간
**담당**: QA + 베타 테스터
**예상 소요 시간**: 2-3일

#### 내부 테스터 초대
```
[ ] 1. App Store Connect → TestFlight 탭

[ ] 2. Internal Testing 섹션

[ ] 3. + 버튼 → Add Internal Testers

[ ] 4. 테스터 이메일 추가:
      - 개발자
      - QA
      - 내부 팀원 (최대 100명)

[ ] 5. 초대 이메일 발송
```

#### 테스터 앱 설치
```
[ ] 테스터가 해야 할 일:
    1. TestFlight 앱 설치 (App Store에서)
    2. 초대 이메일의 링크 클릭
    3. TestFlight에서 "통찰방" 앱 Accept
    4. Install 버튼 클릭
    5. 앱 실행
```

#### 내부 테스트 수행
```
[ ] 1-3의 모든 테스트 항목 재수행

[ ] 추가 테스트:
    [ ] 다양한 iOS 버전 (iOS 14, 15, 16, 17)
    [ ] 다양한 iPhone 모델 (SE, 12, 13, 14, 15)
    [ ] 다양한 네트워크 환경 (WiFi, 4G, 5G)
    [ ] 저사양 기기에서 성능 확인

[ ] 피드백 수집:
    - TestFlight 앱 내 피드백 기능 사용
    - 스크린샷 첨부
    - 크래시 리포트 확인
```

#### 버그 수정 및 재배포
```
[ ] 발견된 버그 수정

[ ] 새로운 빌드 생성:
    - Build Number: 2 (Version은 1.0.0 유지)

[ ] 3-5 과정 반복 (Archive → Upload)

[ ] 테스터에게 새 빌드 알림
```

**완료 조건**:
- ✅ 최소 5명의 내부 테스터 참여
- ✅ 최소 3일간 테스트 진행
- ✅ 크리티컬 버그 모두 해결
- ✅ 크래시율 < 1%

---

### 🟢 3-7. App Store 심사 제출

**우선순위**: 🟢 중간
**담당**: 프로젝트 매니저
**예상 소요 시간**: 30분 (심사 시간: 24-48시간)

#### 최종 확인
```
[ ] 1. App Store Connect → My Apps → 통찰방

[ ] 2. Version 1.0 선택

[ ] 3. 모든 정보 재확인:
      [ ] Screenshots
      [ ] Description
      [ ] Keywords
      [ ] Privacy Policy URL
      [ ] Support URL
      [ ] Demo Account
      [ ] Build 선택

[ ] 4. App Review Information 재확인:
      - 연락처 정보
      - 데모 계정 (동작 확인)
      - 테스트 노트
```

#### 심사 제출
```
[ ] 1. Submit for Review 버튼 클릭

[ ] 2. Export Compliance 선택:
      - 암호화 사용 여부: No (또는 Yes면 추가 정보)

[ ] 3. Advertising Identifier (IDFA):
      - 광고 사용 여부: No

[ ] 4. Submit 클릭

[ ] 5. 상태가 "Waiting for Review"로 변경됨
```

#### 심사 진행 모니터링
```
[ ] 1. 이메일로 상태 업데이트 받음:
      - In Review: 심사 시작
      - Pending Developer Release: 승인 완료
      - Ready for Sale: 출시 완료
      - Rejected: 거절 (이유 확인 후 수정)

[ ] 2. 거절 시:
      - Resolution Center에서 거절 이유 확인
      - 문제 수정
      - 새로운 빌드 업로드 또는 정보 수정
      - 재제출
```

**완료 조건**:
- ✅ 심사 제출 완료
- ✅ "Waiting for Review" 상태
- ✅ 심사 결과 대기 (보통 24-48시간)

---

## 🟢 Phase 4: Google Play 제출 준비 (Android)

**기간**: 2025년 11월 15일 ~ 11월 21일 (iOS와 병행)
**목표**: 내부 테스트 시작

### 🟢 4-1. Google Play Console 계정 생성

**우선순위**: 🟢 중간
**담당**: 프로젝트 매니저
**예상 소요 시간**: 30분
**비용**: $25 (일회성)

#### 단계
```
[ ] 1. Google 계정으로 https://play.google.com/console 접속

[ ] 2. "Create account" 클릭

[ ] 3. 계정 유형 선택:
      - Developer (개인)
      - Organization (회사)

[ ] 4. 개인정보 입력:
      - 이름
      - 이메일
      - 국가

[ ] 5. 결제 정보 입력 ($25)

[ ] 6. 동의서 체크

[ ] 7. 결제 완료

[ ] 8. Play Console 대시보드 접속 확인
```

**완료 조건**:
- ✅ Google Play Console 계정 생성 완료
- ✅ 대시보드 접속 가능

---

### 🟢 4-2. 앱 등록 및 정보 입력

**우선순위**: 🟢 중간
**담당**: 프로젝트 매니저 + 개발자
**예상 소요 시간**: 1시간

#### 앱 등록
```
[ ] 1. Play Console → All apps → Create app

[ ] 2. 정보 입력:
      - App name: 통찰방
      - Default language: Korean
      - App or game: App
      - Free or paid: Free

[ ] 3. Declarations 체크:
      ✅ Developer Program Policies
      ✅ US export laws

[ ] 4. Create app 클릭
```

#### Store Listing
```
[ ] 1. Store presence → Main store listing

[ ] 2. App details:
      [ ] App name: 통찰방
      [ ] Short description (80자):
          "커뮤니티 투표 및 오프라인 모임 관리 플랫폼"
      [ ] Full description (4000자):
          [상세한 앱 설명 작성]

[ ] 3. Graphics:
      [ ] App icon: 512x512 PNG (2-2에서 생성한 파일 사용 가능)
      [ ] Feature graphic: 1024x500 PNG
          (디자이너가 별도 제작 필요)
      [ ] Phone screenshots: 2-4에서 촬영한 스크린샷 업로드 (최소 2장)
      [ ] 7-inch tablet (선택)
      [ ] 10-inch tablet (선택)

[ ] 4. Categorization:
      [ ] App category: Social
      [ ] Tags (선택): Community, Meeting, Voting

[ ] 5. Contact details:
      [ ] Email: [이메일]
      [ ] Phone (선택): [전화번호]
      [ ] Website (선택): https://[YOUR-DOMAIN]

[ ] 6. Privacy Policy:
      [ ] URL: https://[YOUR-DOMAIN]/privacy-policy.html

[ ] 7. Save
```

#### App content
```
[ ] 1. App access:
      [ ] All functionality is available without special access
      (또는 테스트 계정 제공)

[ ] 2. Ads:
      [ ] No, my app does not contain ads

[ ] 3. Content rating:
      [ ] Start questionnaire
      [ ] 질문 답변:
          - Violence: No
          - Sexual content: No
          - Profanity: No
          - Controlled substances: No
          - 등등
      [ ] Calculate rating
      [ ] 예상 등급: Everyone (모든 연령)

[ ] 4. Target audience:
      [ ] Age groups: 13세 이상

[ ] 5. News apps:
      [ ] No

[ ] 6. COVID-19 contact tracing:
      [ ] No

[ ] 7. Data safety:
      [ ] Start
      [ ] Data collection and security:
          ✅ Collects data: Yes
          - Email (선택 사항)
          - User messages (필수)
          - User ID (필수)
      [ ] Data usage:
          ✅ App functionality
          ✅ Analytics
      [ ] Data sharing:
          ❌ No data shared with third parties
      [ ] Save
```

**완료 조건**:
- ✅ 앱 등록 완료
- ✅ Store Listing 작성 완료
- ✅ App content 입력 완료
- ✅ 모든 필수 항목 체크 완료

---

### 🟢 4-3. Keystore 생성 및 서명

**우선순위**: 🟢 중간
**담당**: 개발자
**예상 소요 시간**: 30분

#### Keystore 생성
```bash
# [ ] 터미널에서 실행:
keytool -genkey -v \
  -keystore ~/tongchalban-release.keystore \
  -alias tongchalban \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# [ ] 프롬프트에 답변:
# - Password: [안전한 비밀번호] (잘 기억하기!)
# - First and last name: [이름]
# - Organizational unit: [팀명]
# - Organization: [회사명]
# - City: [도시]
# - State: [주/도]
# - Country code: KR

# [ ] 파일 생성 확인:
ls ~/tongchalban-release.keystore
```

#### Keystore 정보 저장
```
[ ] 안전한 곳에 기록 (비밀번호 관리자):
    - Keystore file: ~/tongchalban-release.keystore
    - Keystore password: [기록]
    - Key alias: tongchalban
    - Key password: [기록] (Keystore password와 동일)

⚠️ 경고: Keystore 파일과 비밀번호를 잃어버리면
        앱 업데이트 불가능!
        안전한 곳에 백업 필수!
```

#### Android 프로젝트 설정
```bash
# [ ] gradle.properties 생성:
cat > android/gradle.properties << EOF
TONGCHALBAN_UPLOAD_STORE_FILE=/Users/[USERNAME]/tongchalban-release.keystore
TONGCHALBAN_UPLOAD_STORE_PASSWORD=[PASSWORD]
TONGCHALBAN_UPLOAD_KEY_ALIAS=tongchalban
TONGCHALBAN_UPLOAD_KEY_PASSWORD=[PASSWORD]
EOF

# ⚠️ gradle.properties를 Git에 커밋하지 말 것!
#    (.gitignore에 추가 확인)
```

#### build.gradle 수정
```
[ ] 파일: android/app/build.gradle

[ ] 다음 섹션 추가 (android { } 블록 안):

signingConfigs {
    release {
        if (project.hasProperty('TONGCHALBAN_UPLOAD_STORE_FILE')) {
            storeFile file(TONGCHALBAN_UPLOAD_STORE_FILE)
            storePassword TONGCHALBAN_UPLOAD_STORE_PASSWORD
            keyAlias TONGCHALBAN_UPLOAD_KEY_ALIAS
            keyPassword TONGCHALBAN_UPLOAD_KEY_PASSWORD
        }
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

**완료 조건**:
- ✅ Keystore 파일 생성
- ✅ Keystore 정보 안전하게 저장
- ✅ Keystore 백업 완료
- ✅ build.gradle 설정 완료

---

### 🟢 4-4. Release AAB 빌드

**우선순위**: 🟢 중간
**담당**: 개발자
**예상 소요 시간**: 30분

#### 빌드 전 준비
```bash
# [ ] 최신 코드 빌드
npm run build && npx cap sync android

# [ ] Android Studio 열기
npx cap open android
```

#### AAB 생성 (Android Studio)
```
[ ] 1. Build → Generate Signed Bundle / APK

[ ] 2. Android App Bundle 선택 → Next

[ ] 3. Key store path:
      - Choose existing: ~/tongchalban-release.keystore
      - Key store password: [입력]
      - Key alias: tongchalban
      - Key password: [입력]

[ ] 4. Next

[ ] 5. Build Variants:
      - release 선택

[ ] 6. Finish

[ ] 7. 빌드 대기 (약 5-10분)

[ ] 8. 성공 메시지 확인:
      "APK(s) generated successfully"
```

#### AAB 파일 위치
```
[ ] android/app/build/outputs/bundle/release/app-release.aab

[ ] 파일 확인:
ls -lh android/app/build/outputs/bundle/release/
```

**완료 조건**:
- ✅ app-release.aab 파일 생성
- ✅ 파일 크기 확인 (약 20-50 MB)
- ✅ 빌드 에러 없음

---

### 🟢 4-5. Play Console 업로드

**우선순위**: 🟢 중간
**담당**: 개발자
**예상 소요 시간**: 30분

#### 내부 테스트 트랙 생성
```
[ ] 1. Play Console → 통찰방 앱 선택

[ ] 2. Release → Testing → Internal testing

[ ] 3. Create new release

[ ] 4. App bundles:
      [ ] Upload: android/app/build/outputs/bundle/release/app-release.aab

[ ] 5. Release name:
      - 1.0.0 (1)

[ ] 6. Release notes (Korean):
      "통찰방 첫 출시!
      - 커뮤니티 투표 시스템
      - 오프라인 모임 관리
      - 실시간 익명 채팅
      - 오늘의 질문"

[ ] 7. Save

[ ] 8. Review release

[ ] 9. Start rollout to Internal testing
```

#### 내부 테스터 초대
```
[ ] 1. Internal testing → Testers 탭

[ ] 2. Create email list

[ ] 3. List name: Internal Testers

[ ] 4. 테스터 이메일 추가 (최대 100명)

[ ] 5. Save changes

[ ] 6. 초대 링크 복사
```

**완료 조건**:
- ✅ AAB 업로드 성공
- ✅ 내부 테스트 트랙 생성
- ✅ 테스터 초대 완료

---

### 🟢 4-6. 내부 테스트 수행

**우선순위**: 🟢 중간
**담당**: QA + 베타 테스터
**예상 소요 시간**: 2-3일

#### 테스터 앱 설치
```
[ ] 테스터가 해야 할 일:
    1. 초대 링크 클릭 (이메일 또는 공유받은 링크)
    2. "Become a tester" 버튼 클릭
    3. Google Play Store로 리다이렉트
    4. 통찰방 앱 검색 또는 직접 이동
    5. Install 버튼 클릭
    6. 앱 실행
```

#### 내부 테스트 수행
```
[ ] 2-1의 모든 테스트 항목 재수행

[ ] 추가 테스트:
    [ ] 다양한 Android 버전 (8, 9, 10, 11, 12, 13, 14)
    [ ] 다양한 제조사 (Samsung, LG, Google Pixel 등)
    [ ] 다양한 화면 크기
    [ ] 다양한 네트워크 환경

[ ] 피드백 수집:
    - Play Console 피드백 기능
    - 스크린샷 첨부
    - 크래시 리포트 확인
```

#### 버그 수정 및 재배포
```
[ ] 발견된 버그 수정

[ ] 새로운 빌드 생성:
    - Version Code: 2 (versionName은 1.0.0 유지)

[ ] 4-4 과정 반복 (AAB 빌드)

[ ] 4-5 과정 반복 (업로드)
```

**완료 조건**:
- ✅ 최소 5명의 내부 테스터 참여
- ✅ 최소 3일간 테스트 진행
- ✅ 크리티컬 버그 모두 해결
- ✅ 크래시율 < 1%

---

### 🟢 4-7. 프로덕션 릴리스 제출

**우선순위**: 🟢 중간
**담당**: 프로젝트 매니저
**예상 소요 시간**: 30분 (심사 시간: 24-48시간)

#### 프로덕션 릴리스 준비
```
[ ] 1. Play Console → Release → Production

[ ] 2. Create new release

[ ] 3. Copy from track: Internal testing (최신 빌드)

[ ] 4. Release name: 1.0.0 (1)

[ ] 5. Release notes (Korean):
      [동일한 릴리스 노트]

[ ] 6. Save

[ ] 7. Review release
```

#### 최종 확인
```
[ ] 1. 모든 필수 항목 완료 확인:
      ✅ Store listing
      ✅ App content
      ✅ Pricing & distribution
      ✅ App access
      ✅ Ads
      ✅ Content rating
      ✅ Target audience
      ✅ Data safety

[ ] 2. Countries:
      - 모든 국가 (또는 선택)

[ ] 3. Consent:
      ✅ This app complies with US export laws
```

#### 심사 제출
```
[ ] 1. Start rollout to Production

[ ] 2. 확인 팝업: Yes, I'm sure

[ ] 3. 상태가 "Pending publication"로 변경됨
```

#### 심사 진행 모니터링
```
[ ] 1. 이메일로 상태 업데이트 받음:
      - Under review: 심사 시작
      - Approved: 승인 완료
      - Published: 출시 완료
      - Changes requested: 수정 요청

[ ] 2. 수정 요청 시:
      - Play Console에서 요청 사항 확인
      - 문제 수정
      - 새로운 빌드 업로드 또는 정보 수정
      - 재제출
```

**완료 조건**:
- ✅ 프로덕션 릴리스 제출 완료
- ✅ "Pending publication" 상태
- ✅ 심사 결과 대기 (보통 24-48시간)

---

## ⚪ Phase 5: 푸시 알림 완전 구현 (선택)

**기간**: 2025년 11월 22일 ~ 11월 30일
**목표**: 네이티브 푸시 알림 작동

### ⚪ 5-1. Supabase device_tokens 테이블 생성

**우선순위**: ⚪ 낮음 (선택)
**담당**: 개발자
**예상 소요 시간**: 30분

#### SQL 실행
```sql
-- [ ] Supabase SQL Editor에서 실행:

CREATE TABLE device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- RLS 정책
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own tokens"
  ON device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tokens"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON device_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON device_tokens FOR DELETE
  USING (auth.uid() = user_id);
```

**완료 조건**:
- ✅ device_tokens 테이블 생성
- ✅ RLS 정책 설정

---

### ⚪ 5-2. Firebase 프로젝트 설정

**우선순위**: ⚪ 낮음
**담당**: 개발자
**예상 소요 시간**: 1시간

#### Firebase Console 설정
```
[ ] 1. https://console.firebase.google.com 접속

[ ] 2. Add project

[ ] 3. Project name: Tongchalban

[ ] 4. Continue

[ ] 5. Enable Google Analytics: Yes (권장)

[ ] 6. Create project

[ ] 7. Continue
```

#### iOS 앱 추가
```
[ ] 1. Project Overview → Add app → iOS

[ ] 2. Bundle ID: com.tongchalban.community

[ ] 3. Register app

[ ] 4. Download GoogleService-Info.plist

[ ] 5. GoogleService-Info.plist를 Xcode 프로젝트에 추가:
      - ios/App/App/ 폴더에 복사
      - Xcode에서 Add Files to "App"
      - Copy items if needed 체크

[ ] 6. Continue

[ ] 7. CocoaPods 설치 (이미 완료됨)

[ ] 8. Next

[ ] 9. Continue to console
```

#### Android 앱 추가
```
[ ] 1. Project Overview → Add app → Android

[ ] 2. Package name: com.tongchalban.community

[ ] 3. Register app

[ ] 4. Download google-services.json

[ ] 5. google-services.json을 Android 프로젝트에 추가:
      - android/app/ 폴더에 복사

[ ] 6. build.gradle 수정 (이미 설정되어 있음)

[ ] 7. Continue

[ ] 8. Next

[ ] 9. Continue to console
```

#### APNs 인증 키 업로드 (iOS)
```
[ ] 1. Firebase Console → Project settings

[ ] 2. Cloud Messaging 탭

[ ] 3. Apple app configuration

[ ] 4. APNs authentication key

[ ] 5. Upload:
      - Apple Developer → Certificates → Keys
      - + 버튼 → Apple Push Notifications service (APNs)
      - Register
      - Download .p8 파일
      - Firebase에 업로드

[ ] 6. Key ID 입력

[ ] 7. Team ID 입력 (Apple Developer → Membership)

[ ] 8. Upload
```

**완료 조건**:
- ✅ Firebase 프로젝트 생성
- ✅ iOS 앱 추가
- ✅ Android 앱 추가
- ✅ APNs 인증 키 업로드

---

### ⚪ 5-3. 푸시 발송 API 구현

**우선순위**: ⚪ 낮음
**담당**: 백엔드 개발자
**예상 소요 시간**: 2-3시간

#### Supabase Edge Function 생성
```bash
# [ ] Supabase CLI 설치 (이미 설치되어 있으면 스킵)
brew install supabase/tap/supabase

# [ ] 로그인
supabase login

# [ ] Edge Function 생성
supabase functions new send-push-notification
```

#### Edge Function 코드 작성
```typescript
// [ ] supabase/functions/send-push-notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY')!

serve(async (req) => {
  try {
    // 요청 파싱
    const { userId, title, body, data } = await req.json()

    // Supabase 클라이언트
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 사용자의 디바이스 토큰 조회
    const { data: tokens, error } = await supabase
      .from('device_tokens')
      .select('token, platform')
      .eq('user_id', userId)

    if (error || !tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ error: 'No tokens found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // FCM으로 푸시 전송
    const results = await Promise.all(
      tokens.map(async ({ token, platform }) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${FIREBASE_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            notification: { title, body },
            data: data || {},
          }),
        })

        return { token, platform, success: response.ok }
      })
    )

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

#### Edge Function 배포
```bash
# [ ] Firebase Server Key 설정
supabase secrets set FIREBASE_SERVER_KEY=[YOUR_FIREBASE_SERVER_KEY]

# [ ] 배포
supabase functions deploy send-push-notification
```

**완료 조건**:
- ✅ Edge Function 작성 완료
- ✅ 배포 성공
- ✅ 테스트 성공

---

### ⚪ 5-4. 실기기에서 푸시 알림 테스트

**우선순위**: ⚪ 낮음
**담당**: QA
**예상 소요 시간**: 1시간

#### iOS 테스트
```
[ ] 1. 실기기에 앱 설치 (3-6 완료 후)

[ ] 2. 앱 실행

[ ] 3. 로그인

[ ] 4. 푸시 알림 권한 허용

[ ] 5. 다른 기기 또는 웹에서:
      - 로그인
      - 채팅 메시지 전송

[ ] 6. 첫 번째 기기에서 푸시 알림 수신 확인:
      - 앱이 백그라운드일 때
      - 앱이 종료되었을 때
      - 앱이 포그라운드일 때
```

#### Android 테스트
```
[ ] 동일하게 테스트
```

**완료 조건**:
- ✅ iOS 푸시 알림 수신 성공
- ✅ Android 푸시 알림 수신 성공
- ✅ 모든 상태(포그라운드/백그라운드/종료)에서 작동

---

## 📅 전체 일정 요약

| Phase | 기간 | 주요 작업 | 마일스톤 |
|-------|------|----------|---------|
| **Phase 1** | 11/5 ~ 11/7 (3일) | 긴급 해결 사항 | 🔴 이미지 업로드 해결, Kakao 로그인 해결, 실기기 테스트 |
| **Phase 2** | 11/8 ~ 11/14 (1주) | 배포 전 필수 사항 | 🟡 Android 테스트, 앱 아이콘, 스크린샷, 개인정보 처리방침 |
| **Phase 3** | 11/15 ~ 11/21 (1주) | iOS App Store 제출 | 🟢 TestFlight 베타, 심사 제출 |
| **Phase 4** | 11/15 ~ 11/21 (1주) | Android Play Store 제출 | 🟢 내부 테스트, 심사 제출 |
| **Phase 5** | 11/22 ~ 11/30 (선택) | 푸시 알림 구현 | ⚪ 네이티브 푸시 알림 |

**최종 목표일**: 2025년 11월 말 (예상)

---

## 🎯 성공 기준

### Phase 1 완료 조건
- ✅ 이미지 업로드 400 에러 완전 해결
- ✅ Kakao 로그인 KOE006 에러 해결
- ✅ iPhone 12 실기기에서 모든 기능 테스트 통과

### Phase 2 완료 조건
- ✅ Android 에뮬레이터/실기기 테스트 통과
- ✅ 앱 아이콘 및 스플래시 생성
- ✅ 스크린샷 촬영 완료 (iOS + Android)
- ✅ 개인정보 처리방침 페이지 작성

### Phase 3 완료 조건 (iOS)
- ✅ Apple Developer Program 가입
- ✅ TestFlight 베타 테스트 3일 이상
- ✅ App Store 심사 제출
- ✅ 승인 대기 또는 승인 완료

### Phase 4 완료 조건 (Android)
- ✅ Google Play Console 계정 생성
- ✅ 내부 테스트 3일 이상
- ✅ 프로덕션 릴리스 제출
- ✅ 승인 대기 또는 승인 완료

### 최종 출시 조건
- ✅ iOS App Store: "Ready for Sale" 상태
- ✅ Android Google Play: "Published" 상태
- ✅ 크래시율 < 1%
- ✅ 사용자 평점 > 4.0

---

## 📞 지원 및 문의

### 이슈 발생 시
1. CURRENT_PROJECT_STATUS.md 확인
2. MOBILE_DEPLOYMENT_NOTES.md 문제 해결 섹션 확인
3. 해당 Phase의 문서 재확인
4. GitHub Issues에 리포트

### 도움이 필요한 경우
- Slack 채널: #tongchalban-dev
- 이메일: dev@tongchalban.com
- 긴급: [긴급 연락처]

---

**최종 업데이트**: 2025년 11월 5일
**작성자**: Claude Code
**버전**: 1.0.0

**다음 체크포인트**: 2025년 11월 7일 (Phase 1 완료 예정)
