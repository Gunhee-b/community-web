# 통찰방 모바일 앱 배포 체크리스트

**최종 업데이트**: 2025-10-31
**현재 버전**: v2.6.1
**프로젝트 상태**: 🟡 배포 준비 중 (테스트 필요)

---

## 📊 현재 개발 단계

### ✅ 완료된 작업 (2025-10-31)

#### 1. 모바일 UI 최적화 완료
- ✅ **WriteAnswerPage (답변 작성 페이지)**
  - 이미지 업로드 영역 터치 영역 확대 (p-8 on mobile, p-6 on desktop)
  - 이미지 아이콘 크기 증가 (w-12 h-12 on mobile)
  - `touch-manipulation` CSS 속성 추가 (더블탭 줌 방지)
  - `active:` 상태 추가로 터치 피드백 개선
  - 하단 버튼 최소 높이 44px (iOS HIG 권장 사항)
  - Safe Area Inset 지원 (노치/Dynamic Island 대응)
  - 버튼 조건 로직 단순화 및 오류 수정

- ✅ **QuestionDetailPage (질문 상세 및 댓글)**
  - 댓글 입력 textarea 높이 조정 (rows={3})
  - 댓글 작성/삭제 버튼 터치 영역 확대
  - 텍스트 크기 반응형 조정 (text-sm md:text-base)
  - `break-words` 추가로 긴 단어 처리
  - 댓글 폼 배경색 추가 (bg-gray-50 p-3)
  - 모든 인터랙티브 요소에 최소 터치 크기 보장
  - 헤더 레이아웃 모바일 최적화

- ✅ **Tailwind 설정 업데이트**
  - `safe-bottom` 유틸리티 클래스 추가
  - `touch-manipulation` 유틸리티 클래스 추가
  - Safe Area Inset 지원

#### 2. 빌드 및 동기화 완료
- ✅ 프로덕션 빌드 성공 (vite build)
- ✅ Capacitor 동기화 완료 (iOS/Android)
- ✅ 7개 네이티브 플러그인 확인
- ✅ PWA 설정 유지

---

## 🎯 앱 배포 전 체크리스트

### 단계 1: 기능 테스트 (iPhone 12 실기기 필수)

#### A. 기본 기능 테스트
- [ ] 로그인/로그아웃
- [ ] 회원가입 (초대 코드)
- [ ] 홈 화면 탐색
- [ ] 네비게이션 (모든 메뉴)

#### B. 질문 및 답변 기능 (핵심)
- [ ] 질문 목록 조회
- [ ] 질문 상세 페이지 조회
- [ ] **답변 작성 페이지 접근**
- [ ] **텍스트 답변 작성 (textarea 입력)**
- [ ] **이미지 업로드 (갤러리 선택)**
- [ ] **이미지 업로드 (카메라 촬영)** - 실기기 전용
- [ ] **이미지 2장 업로드**
- [ ] **이미지 개별 삭제**
- [ ] **답변 저장 (텍스트만)**
- [ ] **답변 저장 (이미지만)**
- [ ] **답변 저장 (텍스트 + 이미지)**
- [ ] **답변 수정**
- [ ] **답변 삭제**

#### C. 댓글 기능 (핵심)
- [ ] **댓글 작성 폼 열기/닫기**
- [ ] **댓글 텍스트 입력**
- [ ] **댓글 저장**
- [ ] **댓글 목록 조회**
- [ ] **본인 댓글 삭제**

#### D. 기타 기능
- [ ] 투표 시스템
- [ ] 베스트 글
- [ ] 철학챗 (모임)
- [ ] 프로필
- [ ] 알림

#### E. 모바일 UI/UX 검증
- [ ] **터치 영역이 충분한가? (최소 44x44pt)**
- [ ] **버튼 탭 시 즉각 반응하는가?**
- [ ] **키보드가 올라올 때 입력 필드가 가려지지 않는가?**
- [ ] **Safe Area가 제대로 적용되는가? (노치/Dynamic Island)**
- [ ] **스크롤이 부드러운가?**
- [ ] **이미지 로딩이 빠른가?**
- [ ] **오프라인에서 적절한 에러 메시지가 표시되는가?**

---

## 🚀 단계 2: 앱 배포 준비

### iOS App Store 배포 체크리스트

#### 1. 개발자 계정 및 인증서
- [ ] Apple Developer Program 가입 ($99/year)
- [ ] App ID 생성 (com.tongchalban.community)
- [ ] Provisioning Profile 생성
- [ ] Distribution Certificate 생성

#### 2. 앱 정보 준비
- [ ] 앱 이름: "통찰방"
- [ ] 앱 아이콘 (1024x1024)
- [ ] 스플래시 스크린
- [ ] 스크린샷 (필수)
  - iPhone 6.7" (1290x2796) - 최소 3장
  - iPhone 6.5" (1242x2688) - 최소 3장
  - iPhone 5.5" (1242x2208) - 최소 3장
- [ ] 앱 설명 (한글)
- [ ] 키워드
- [ ] 카테고리: 소셜 네트워킹 / 라이프스타일
- [ ] 연령 제한
- [ ] 개인정보 처리방침 URL
- [ ] 지원 URL

#### 3. Xcode 설정
- [ ] Bundle ID 확인: com.tongchalban.community
- [ ] Version: 1.0.0
- [ ] Build Number: 1
- [ ] Deployment Target: iOS 14.0+
- [ ] 권한 설명 문구 확인 (Info.plist)
  - NSCameraUsageDescription ✅
  - NSPhotoLibraryUsageDescription ✅
  - NSPhotoLibraryAddUsageDescription ✅
  - NSLocationWhenInUseUsageDescription ✅

#### 4. 빌드 및 제출
- [ ] Archive 빌드 생성 (Xcode)
- [ ] Archive 업로드 (App Store Connect)
- [ ] TestFlight 베타 테스트
- [ ] App Store 제출

---

### Android Play Store 배포 체크리스트

#### 1. 개발자 계정
- [ ] Google Play Console 계정 생성 ($25 일회성)
- [ ] 앱 등록

#### 2. 앱 정보 준비
- [ ] 앱 이름: "통찰방"
- [ ] 앱 아이콘 (512x512)
- [ ] Feature Graphic (1024x500)
- [ ] 스크린샷 (필수)
  - Phone (최소 2장)
  - 7-inch tablet (선택)
  - 10-inch tablet (선택)
- [ ] 짧은 설명 (80자 이내)
- [ ] 전체 설명 (4000자 이내)
- [ ] 카테고리: 소셜 / 커뮤니케이션
- [ ] 개인정보 처리방침 URL
- [ ] 지원 이메일

#### 3. Android Studio 설정
- [ ] Package Name: com.tongchalban.community
- [ ] Version Name: 1.0.0
- [ ] Version Code: 1
- [ ] Min SDK: 22 (Android 5.1)
- [ ] Target SDK: 34 (Android 14)
- [ ] 권한 확인 (AndroidManifest.xml) ✅

#### 4. 서명 및 빌드
- [ ] Keystore 생성
- [ ] Release Build (AAB 형식)
- [ ] APK 서명
- [ ] Play Console 업로드
- [ ] 내부 테스트 트랙
- [ ] 프로덕션 출시

---

## ⚠️ 알려진 이슈 및 해결 필요 사항

### 1. 이미지 업로드 400 에러 (진행 중)
**문제**: `CURRENT_STATUS.md`에 따르면 이미지 업로드 시 400 에러 발생
**원인**:
- Supabase Storage 버킷 미생성 가능성
- `image_url_2` 컬럼 누락 가능성
- RLS 정책 미설정 가능성

**해결 방법**:
1. Supabase Dashboard에서 `answer-images` 버킷 생성 확인
2. 다음 SQL 실행 확인:
   ```sql
   -- image_url_2 컬럼 확인
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'question_answers'
   AND column_name LIKE '%image%';
   ```
3. Storage 정책 확인

**우선순위**: 🔴 높음 - 배포 전 필수 해결

---

## 📱 플랫폼별 테스트 환경

### 현재 테스트 환경
- ✅ **개발 환경**: macOS (Darwin 24.6.0)
- ✅ **Xcode**: 17.0.0
- ✅ **iOS 시뮬레이터**: iPhone 17 (테스트 완료)
- ⏳ **실기기**: iPhone 12 (테스트 대기)
- ⏳ **Android 에뮬레이터**: 미테스트

### 권장 테스트 기기
**iOS**:
- iPhone 12 (실기기) - 카메라/갤러리 테스트 필수
- iPhone 15 Pro (시뮬레이터) - Dynamic Island 테스트
- iPad (시뮬레이터) - 태블릿 레이아웃

**Android**:
- Pixel 6 (에뮬레이터 또는 실기기)
- Samsung Galaxy S21 (실기기 권장)

---

## 🔧 남은 작업 우선순위

### 🔴 높음 (배포 전 필수)
1. **이미지 업로드 400 에러 해결**
   - Supabase Storage 설정 확인
   - DB 스키마 확인
   - 실기기에서 이미지 업로드 테스트

2. **iPhone 12 실기기 전체 테스트**
   - 모든 기능 체크리스트 완료
   - 카메라 촬영 테스트
   - 갤러리 선택 테스트
   - 성능 확인

3. **앱 아이콘 및 스플래시 생성**
   ```bash
   npm run cap:assets
   ```

### 🟡 중간 (배포 후 개선 가능)
4. **Android 에뮬레이터 테스트**
5. **스크린샷 촬영 (App Store/Play Store)**
6. **앱 설명 작성**
7. **개인정보 처리방침 페이지 작성**

### 🟢 낮음 (선택사항)
8. **푸시 알림 구현**
9. **앱 성능 최적화**
10. **오프라인 모드 지원**

---

## 📊 현재 프로젝트 상태

### 기술 스택
- **Frontend**: React 18 + Vite
- **Mobile**: Capacitor 7.4.4
- **Backend**: Supabase
- **Styling**: Tailwind CSS
- **State**: Zustand

### 빌드 정보
- **웹 빌드**: dist/ (610.83 KB)
- **iOS 프로젝트**: ios/App/App.xcworkspace
- **Android 프로젝트**: android/

### 설치된 Capacitor 플러그인 (7개)
1. @capacitor/app (앱 상태)
2. @capacitor/camera (카메라/갤러리)
3. @capacitor/network (네트워크 상태)
4. @capacitor/preferences (로컬 스토리지)
5. @capacitor/push-notifications (푸시 알림)
6. @capacitor/splash-screen (스플래시)
7. @capacitor/status-bar (상태바)

---

## 📝 테스트 시나리오 예제

### 시나리오 1: 이미지와 함께 답변 작성 (핵심)

1. 로그인
2. "오늘의 질문" 메뉴 선택
3. 질문 하나 선택
4. "✍️ 답변 작성하기" 버튼 탭
5. 텍스트 입력 (50자 이상)
6. "이미지 1" 영역 탭
7. "갤러리" 선택
8. 사진 1장 선택
9. 미리보기 확인
10. "✍️ 작성 완료" 버튼 탭
11. 성공 메시지 확인
12. 질문 상세 페이지로 돌아가서 내 답변 확인

**예상 결과**: 답변이 정상적으로 저장되고 이미지가 표시됨

**실제 결과**: (테스트 후 기록)

---

### 시나리오 2: 댓글 작성 (핵심)

1. 질문 상세 페이지에서 다른 사용자의 답변 확인
2. "댓글 달기" 버튼 탭
3. 댓글 입력 폼이 나타남
4. 텍스트 입력 (10자 이상)
5. "댓글 작성" 버튼 탭
6. 성공 메시지 확인
7. 댓글이 목록에 표시됨

**예상 결과**: 댓글이 정상적으로 저장되고 표시됨

**실제 결과**: (테스트 후 기록)

---

## 🎓 참고 문서

### 프로젝트 문서
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Capacitor 설정 완료 현황
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - 이미지 업로드 이슈
- [README.md](./README.md) - 프로젝트 개요
- [CAPACITOR_SETUP.md](./CAPACITOR_SETUP.md) - Capacitor 설정 가이드
- [TEST_GUIDE.md](./TEST_GUIDE.md) - 상세 테스트 방법

### 외부 자료
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## ✅ 다음 단계

### 즉시 해야 할 일
1. **iPhone 12를 Mac에 연결**
2. **Xcode에서 실기기 선택 후 빌드**
3. **"시나리오 1: 이미지와 함께 답변 작성" 테스트**
4. **"시나리오 2: 댓글 작성" 테스트**
5. **이슈 발견 시 기록하고 수정**

### 배포 일정 (예상)
- **Week 1**: 실기기 테스트 및 이슈 수정
- **Week 2**: 앱 아이콘/스크린샷 준비
- **Week 3**: TestFlight 베타 테스트
- **Week 4**: App Store/Play Store 제출

---

**마지막 업데이트**: 2025-10-31
**작성자**: Claude Code
**버전**: 1.0.0
