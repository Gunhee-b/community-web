# 🚀 Rezom Community - 앱스토어 배포 체크리스트

> **현재 상태**: Expo 프로젝트 (v54.0.23)
> **번들 ID**: com.rezom.community
> **버전**: 1.0.0

---

## 📋 목차
1. [필수 사전 준비](#1-필수-사전-준비)
2. [앱 정보 및 메타데이터](#2-앱-정보-및-메타데이터)
3. [기술적 설정](#3-기술적-설정)
4. [Apple Developer 계정 설정](#4-apple-developer-계정-설정)
5. [빌드 및 테스트](#5-빌드-및-테스트)
6. [App Store Connect 준비](#6-app-store-connect-준비)
7. [법적 요구사항](#7-법적-요구사항)
8. [최종 점검](#8-최종-점검)

---

## 1. 필수 사전 준비

### ✅ Apple Developer 계정
- [ ] Apple Developer Program 가입 완료 (연간 $99)
- [ ] 법인/개인 개발자 계정 확인
- [ ] 결제 정보 등록 완료
- [ ] Team ID 확인

### ✅ 개발 환경
- [ ] macOS 최신 버전 (Xcode 요구사항 충족)
- [ ] Xcode 최신 버전 설치 (현재 15.x 권장)
- [ ] Command Line Tools 설치
- [ ] CocoaPods 설치 확인

---

## 2. 앱 정보 및 메타데이터

### ✅ 앱 기본 정보 (app.json)
**현재 설정:**
```json
{
  "name": "Rezom Community",
  "slug": "rezom-community",
  "version": "1.0.0",
  "bundleIdentifier": "com.rezom.community"
}
```

**점검 필요:**
- [ ] 앱 이름이 최종 확정되었는가?
- [ ] Bundle Identifier가 고유한가?
- [ ] 버전 번호가 적절한가? (1.0.0)
- [ ] Build Number 설정 (자동 증가 권장)

### ✅ 앱 아이콘 및 스플래시 스크린
**현재 상태:**
```
✅ icon.png (1024x1024)
✅ adaptive-icon.png
✅ splash-icon.png
✅ favicon.png
```

**점검 사항:**
- [ ] **앱 아이콘 (필수)**
  - 1024x1024 PNG (투명도 없음)
  - 모든 iOS 크기에 대응 (App Store용)
  - 브랜드 가이드라인 준수

- [ ] **스플래시 스크린**
  - 다양한 화면 크기 대응
  - 로딩 시간 최적화 (2-3초 이내)

### ✅ 앱 스토어 스크린샷
**필수 크기 (iOS):**
- [ ] 6.7" Display (iPhone 15 Pro Max): 1290 x 2796
- [ ] 6.5" Display (iPhone 11 Pro Max): 1242 x 2688
- [ ] 5.5" Display (iPhone 8 Plus): 1242 x 2208
- [ ] iPad Pro (12.9"): 2048 x 2732

**권장 스크린샷 (각 크기별 최대 10개):**
1. 홈 화면 (오늘의 질문, 다가오는 모임)
2. 모임 목록 화면
3. 모임 상세 & 채팅
4. 질문 목록 및 답변
5. 프로필 화면

### ✅ 앱 설명 텍스트
- [ ] **앱 이름** (30자 이내)
  - 현재: "Rezom Community"

- [ ] **부제목** (30자 이내)
  - 예: "커피와 술, 모임의 시작"

- [ ] **홍보 문구** (170자 이내)
  - 짧고 임팩트 있는 앱 소개

- [ ] **설명** (4000자 이내)
  - 주요 기능 설명
  - 사용 방법
  - 차별점

- [ ] **키워드** (100자 이내, 쉼표로 구분)
  - 예: "모임,커뮤니티,채팅,투표,질문,답변,오프라인"

### ✅ 앱 미리보기 비디오 (선택사항)
- [ ] 15-30초 길이
- [ ] 주요 기능 시연
- [ ] 각 화면 크기별 제작

---

## 3. 기술적 설정

### ✅ app.json 설정 확인

#### 현재 설정:
```json
{
  "ios": {
    "bundleIdentifier": "com.rezom.community",
    "supportsTablet": true,
    "buildNumber": "1" // ⚠️ 추가 필요
  }
}
```

#### 추가 필요 설정:
- [ ] **buildNumber** 설정
  ```json
  "buildNumber": "1"
  ```

- [ ] **Privacy 설정 (필수)**
  ```json
  "infoPlist": {
    "NSPhotoLibraryUsageDescription": "프로필 사진 및 게시물 이미지를 업로드하기 위해 사진 라이브러리에 접근합니다.",
    "NSCameraUsageDescription": "프로필 사진 촬영을 위해 카메라에 접근합니다.",
    "NSUserTrackingUsageDescription": "더 나은 서비스 제공을 위해 사용자 활동을 추적합니다." // ATT 사용 시
  }
  ```

- [ ] **App Transport Security (ATS)**
  - HTTPS 사용 확인
  - Supabase URL이 HTTPS인지 확인 ✅

### ✅ 환경 변수 및 시크릿
**현재 사용 중인 환경 변수:**
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_KAKAO_CLIENT_ID
EXPO_PUBLIC_KAKAO_CLIENT_SECRET
```

**점검 사항:**
- [ ] `.env` 파일이 git에 커밋되지 않았는가?
- [ ] 프로덕션 환경 변수가 올바르게 설정되었는가?
- [ ] API 키가 노출되지 않았는가?
- [ ] EAS Build Secrets 설정 완료 (EAS 사용 시)

### ✅ 딥링크 및 URL Scheme
**현재 설정:**
```json
"scheme": "rezom",
"CFBundleURLSchemes": [
  "kakao57450a0289e45de479273c9fc168f4fb",
  "rezom"
]
```

**점검 사항:**
- [ ] Universal Links 설정 (선택사항)
- [ ] 카카오 로그인 딥링크 테스트 완료
- [ ] Associated Domains 설정 (필요 시)

### ✅ 푸시 알림 (선택사항)
- [ ] Apple Push Notification Service (APNs) 인증서 생성
- [ ] Expo Push Token 설정
- [ ] 알림 권한 요청 문구 작성
- [ ] 푸시 알림 테스트 완료

### ✅ 서드파티 SDK 및 라이브러리
**현재 사용 중:**
- Supabase
- Kakao Login SDK
- Expo Router
- React Navigation

**점검 사항:**
- [ ] 모든 라이브러리가 최신 버전인가?
- [ ] 보안 취약점이 없는가? (`npm audit`)
- [ ] 사용하지 않는 패키지 제거
- [ ] 라이선스 확인 (상업적 사용 가능 여부)

---

## 4. Apple Developer 계정 설정

### ✅ Certificates (인증서)
- [ ] **Development Certificate** 생성
- [ ] **Distribution Certificate** 생성 (App Store)
  - Certificate Type: Apple Distribution
  - CSR 파일 생성 (Keychain Access)

### ✅ Identifiers (앱 ID)
- [ ] App ID 등록
  - Bundle ID: `com.rezom.community`
  - App ID Description: "Rezom Community"

- [ ] **Capabilities 설정:**
  - [ ] Push Notifications (알림 사용 시)
  - [ ] Associated Domains (Universal Links 사용 시)
  - [ ] Sign in with Apple (Apple 로그인 사용 시)

### ✅ Provisioning Profiles
- [ ] Development Provisioning Profile
- [ ] Ad Hoc Provisioning Profile (테스트용)
- [ ] App Store Provisioning Profile (배포용)

### ✅ Devices (테스트 기기)
- [ ] 테스트용 iOS 기기 UDID 등록 (최대 100개)

---

## 5. 빌드 및 테스트

### ✅ 로컬 빌드 테스트
```bash
# 1. Prebuild
npx expo prebuild --platform ios --clean

# 2. iOS 빌드 (Xcode)
npx expo run:ios --configuration Release
```

**점검 사항:**
- [ ] Release 모드에서 빌드 성공
- [ ] 모든 기능이 정상 작동
- [ ] 앱 크기 확인 (200MB 이하 권장)
- [ ] 성능 테스트 (느린 네트워크 환경)

### ✅ TestFlight 테스트
- [ ] **Internal Testing** (내부 테스터)
  - 최대 100명
  - 빠른 배포 (자동 승인)

- [ ] **External Testing** (외부 테스터)
  - 최대 10,000명
  - Apple 검토 필요 (1-2일 소요)

**테스트 체크리스트:**
- [ ] 회원가입/로그인 플로우
- [ ] 카카오 소셜 로그인
- [ ] 모임 생성 및 참여
- [ ] 채팅 기능
- [ ] 질문 작성 및 답변
- [ ] 이미지 업로드
- [ ] 푸시 알림 (설정 시)
- [ ] 다크 모드
- [ ] iPad 지원 (설정 시)

### ✅ EAS Build (권장)
```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# EAS 프로젝트 설정
eas build:configure

# iOS 빌드
eas build --platform ios --profile production
```

**eas.json 설정 예시:**
```json
{
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "com.rezom.community",
        "buildNumber": "1"
      }
    }
  }
}
```

---

## 6. App Store Connect 준비

### ✅ 앱 등록
1. [ ] App Store Connect 접속
2. [ ] "나의 앱" → "+" → "새로운 앱"
3. [ ] 플랫폼: iOS
4. [ ] 이름: Rezom Community
5. [ ] 기본 언어: 한국어
6. [ ] Bundle ID: com.rezom.community
7. [ ] SKU: 고유 식별자 (예: REZOM-COMMUNITY-001)

### ✅ 앱 정보 입력
- [ ] **카테고리**
  - 주 카테고리: 소셜 네트워킹
  - 부 카테고리: 라이프스타일

- [ ] **연령 등급**
  - 콘텐츠 설명 제공
  - 부적절한 콘텐츠 없음 확인

- [ ] **가격 및 배포 가능 지역**
  - 무료 앱
  - 대한민국 (또는 전 세계)

### ✅ 앱 버전 정보
- [ ] 버전: 1.0.0
- [ ] 빌드: 1 (Xcode에서 업로드한 빌드 선택)
- [ ] 저작권: © 2025 Rezom Community
- [ ] 개인정보 처리방침 URL (필수)
- [ ] 지원 URL (필수)

### ✅ 검토 정보
- [ ] **데모 계정** (필요 시)
  - 이메일: demo@rezom.com
  - 비밀번호: Demo1234!

- [ ] **검토 노트**
  - 특별한 설정이나 테스트 방법 설명
  - 카카오 로그인 관련 안내

- [ ] **연락처 정보**
  - 이름, 전화번호, 이메일

---

## 7. 법적 요구사항

### ✅ 개인정보 처리방침
- [ ] 웹사이트에 호스팅
- [ ] 한국어 및 영어 버전 준비
- [ ] 다음 내용 포함:
  - 수집하는 정보 (이메일, 이름, 프로필 사진 등)
  - 정보 사용 목적
  - 제3자 공유 여부
  - 데이터 보관 기간
  - 사용자 권리 (열람, 수정, 삭제)

### ✅ 이용 약관
- [ ] 서비스 이용 규칙
- [ ] 사용자 의무사항
- [ ] 서비스 제공자 책임 한계
- [ ] 분쟁 해결 방법

### ✅ App Store 검토 가이드라인 준수
- [ ] **금지된 콘텐츠 없음**
  - 폭력, 성인, 불법 콘텐츠
  - 저작권 침해

- [ ] **사용자 생성 콘텐츠 관리**
  - 신고 기능
  - 콘텐츠 모더레이션 정책

- [ ] **데이터 수집 및 사용**
  - 명확한 권한 요청 문구
  - App Privacy Details 작성 (필수)

### ✅ App Privacy Details (앱 개인정보 보호)
**수집하는 데이터:**
- [ ] 연락처 정보 (이메일)
- [ ] 사용자 콘텐츠 (게시물, 댓글)
- [ ] 식별자 (사용자 ID)
- [ ] 사용 데이터 (앱 사용 통계)

**데이터 사용 목적:**
- [ ] 앱 기능 제공
- [ ] 분석
- [ ] 제품 개인화

**데이터 추적 여부:**
- [ ] 추적 안 함 / 추적함 (선택)

---

## 8. 최종 점검

### ✅ 기능 테스트
- [ ] 회원가입/로그인 (이메일, 카카오)
- [ ] 모임 CRUD (생성, 읽기, 수정, 삭제)
- [ ] 채팅 전송 및 수신
- [ ] 이미지 업로드
- [ ] 알림 수신 (설정 시)
- [ ] 오프라인 모드 (네트워크 에러 처리)
- [ ] 로그아웃

### ✅ UI/UX 점검
- [ ] 다양한 기기 크기 테스트 (iPhone SE, 15 Pro Max)
- [ ] 다크 모드 지원
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 한국어 표시
- [ ] 버튼 크기 (최소 44x44 pt)
- [ ] Safe Area 적용

### ✅ 성능 최적화
- [ ] 앱 시작 시간 (3초 이내)
- [ ] 이미지 압축 및 최적화
- [ ] API 호출 최소화
- [ ] 메모리 누수 확인
- [ ] 배터리 소모 테스트

### ✅ 보안
- [ ] HTTPS 통신
- [ ] API 키 보안
- [ ] 사용자 인증 토큰 안전 저장
- [ ] SQL Injection 방지
- [ ] XSS 방지

### ✅ 문서화
- [ ] README.md 작성
- [ ] CHANGELOG.md 작성
- [ ] API 문서
- [ ] 사용자 가이드 (선택사항)

---

## 🚨 주요 이슈 및 해결 필요 사항

### ⚠️ 현재 발견된 이슈
1. **TypeScript 컴파일 오류** (app/(auth)/login.tsx)
   - KeyboardAvoidingView 스타일 타입 오류
   - 배포 전 수정 필요

2. **Expo 패키지 버전 불일치**
   ```
   expo@54.0.23 → 54.0.24
   expo-auth-session@7.0.8 → 7.0.9
   expo-linking@8.0.8 → 8.0.9
   expo-router@6.0.14 → 6.0.15
   expo-splash-screen@31.0.10 → 31.0.11
   ```
   - 배포 전 업데이트 권장

3. **app.json 누락 설정**
   - `buildNumber` 추가 필요
   - Privacy 설명 문구 추가 필요

---

## 📚 참고 자료

### Apple 공식 문서
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

### Expo 문서
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Deployment](https://docs.expo.dev/submit/ios/)
- [App Configuration](https://docs.expo.dev/versions/latest/config/app/)

### 추가 도구
- [App Store Screenshot Generator](https://www.appstorescreenshot.com/)
- [App Icon Generator](https://appicon.co/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

---

## 📝 타임라인 예상

| 단계 | 예상 소요 시간 |
|------|---------------|
| 앱 정보 및 스크린샷 준비 | 2-3일 |
| 개인정보 처리방침 작성 | 1일 |
| TestFlight 빌드 및 테스트 | 1-2일 |
| App Store 제출 | 1일 |
| Apple 검토 | 1-3일 (평균 24-48시간) |
| **총 예상 기간** | **1-2주** |

---

## ✅ 배포 준비 완료 체크
- [ ] 모든 체크리스트 항목 완료
- [ ] 테스트 완료 (기능, 성능, 보안)
- [ ] 법적 문서 준비 완료
- [ ] App Store Connect 설정 완료
- [ ] 최종 빌드 업로드
- [ ] 검토 제출

---

**마지막 업데이트**: 2025-11-18
**작성자**: Claude Code Assistant
