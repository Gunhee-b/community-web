# App Store 배포 가이드

App Store Connect를 통해 재심사를 제출하는 전체 과정입니다.

---

## 사전 준비사항 ✅

### 1. 차단 기능 구현 확인
- [x] Supabase SQL 실행 완료
- [x] 앱에서 차단 기능 테스트 완료
- [x] 차단 목록 관리 기능 확인

### 2. 계정 및 인증서
- [x] Apple Developer Account (유료 계정)
- [x] App Store Connect 접근 권한
- [x] Expo/EAS 계정

---

## 1단계: 빌드 번호 확인 및 증가

현재 앱 정보:
- **Bundle ID**: `com.rezom.community`
- **Version**: `1.0.0`
- **Build Number**: `4` ✅ (이미 증가됨)

> ℹ️ 빌드 번호는 이미 4로 설정되어 있습니다. App Store에 이전에 제출한 빌드 번호보다 커야 합니다.

---

## 2단계: 로컬 테스트

앱이 제대로 작동하는지 확인:

```bash
# 개발 서버 시작
npx expo start

# iOS 시뮬레이터에서 테스트
npx expo run:ios
```

### 테스트 체크리스트
- [ ] 앱이 정상적으로 실행됨
- [ ] 답변/질문/모임 상세에서 차단 버튼 표시
- [ ] 차단 기능 작동 확인
- [ ] 설정 > 차단 목록 접근 가능
- [ ] 차단 해제 기능 작동

---

## 3단계: EAS Build로 Production 빌드 생성

### EAS CLI 설치 (처음인 경우)

```bash
npm install -g eas-cli
eas login
```

### EAS 프로젝트 설정 확인

`eas.json` 파일이 있는지 확인:

```bash
# eas.json이 없다면 생성
eas build:configure
```

### iOS Production 빌드

```bash
# App Store 제출용 빌드 생성
eas build --platform ios --profile production

# 또는 특정 프로필 사용
eas build -p ios
```

빌드 과정:
1. Expo 서버에서 빌드 시작
2. 약 10-20분 소요
3. 완료되면 `.ipa` 파일 생성

> ℹ️ 빌드가 완료되면 자동으로 App Store Connect에 업로드됩니다.

---

## 4단계: App Store Connect에서 빌드 확인

### 1. App Store Connect 접속
https://appstoreconnect.apple.com

### 2. 앱 선택
- **My Apps** 클릭
- **Rezom** 앱 선택

### 3. 빌드 확인
- 좌측 메뉴에서 **TestFlight** 클릭
- **iOS Builds** 섹션에서 새 빌드 확인
- 빌드 번호 **1.0.0 (4)** 확인

> ⚠️ 빌드가 App Store Connect에 표시되기까지 5-10분 소요될 수 있습니다.

---

## 5단계: 새 버전 준비 (재심사용)

### 1. 앱 정보 탭 이동
- 좌측 메뉴에서 **App Store** 클릭
- **+ 버전 또는 플랫폼** 클릭 (또는 기존 버전 수정)

### 2. 버전 정보 확인
- **버전**: `1.0.0`
- **빌드 선택**: `1.0.0 (4)` 선택

### 3. App Review Information 업데이트

**Notes (심사 노트)** 섹션에 다음 내용 추가:

```
안녕하세요,

이전 반려 사항(Guideline 1.2 - User-Generated Content)을 해결했습니다.

## 사용자 차단 기능 구현 완료

### 1. 차단 기능 접근 방법
- 답변/질문/모임 상세 화면에서 "차단" 버튼 클릭
- 차단 확인 모달에서 차단 효과를 확인한 후 "차단하기" 선택

### 2. 차단 효과
- 차단한 사용자의 모든 답변이 피드에서 숨김 처리됩니다
- 차단한 사용자가 만든 모임이 목록에서 제외됩니다
- 차단한 사용자의 댓글이 표시되지 않습니다

### 3. 차단 관리
- 설정 > 계정 관리 > 차단 목록에서 차단한 사용자 확인 가능
- 차단 목록에서 "차단 해제" 버튼으로 언제든지 차단 해제 가능

### 4. 접근성
- 모든 사용자 생성 콘텐츠 화면에 차단 버튼이 명확히 표시됨
- 차단 모달에서 차단의 효과를 명확하게 설명
- 설정 메뉴에서 차단 목록에 쉽게 접근 가능

### 테스트 방법
1. 앱 실행 후 로그인
2. 홈 > 질문 탭에서 아무 질문 선택
3. 답변 목록에서 답변 선택 (상세 화면 이동)
4. 화면 하단의 "차단" 버튼 클릭
5. 차단 확인 모달 확인
6. 설정 > 차단 목록에서 확인

감사합니다.
```

### 4. 스크린샷 확인 (선택사항)
차단 기능을 보여주는 스크린샷을 추가하면 좋습니다:
- 차단 버튼이 있는 화면
- 차단 확인 모달
- 차단 목록 화면

---

## 6단계: 심사 제출

### 1. 모든 정보 확인
- [ ] 빌드 선택됨 (1.0.0 build 4)
- [ ] App Review Notes 작성 완료
- [ ] 개인정보처리방침 URL 유효
- [ ] 이용약관 URL 유효 (있는 경우)

### 2. 심사 제출
1. 화면 우측 상단 **심사에 추가** 클릭
2. 모든 항목 확인
3. **제출** 버튼 클릭

---

## 7단계: 심사 진행 상황 모니터링

### 심사 상태 확인
App Store Connect에서 확인 가능:

1. **Waiting for Review** (심사 대기 중)
   - 보통 1-3일 소요

2. **In Review** (심사 중)
   - 보통 1-2일 소요

3. **Pending Developer Release** (승인됨)
   - 수동 출시 설정인 경우
   - 출시 버튼 클릭하여 배포

4. **Ready for Sale** (판매 준비 완료)
   - 앱이 App Store에 출시됨

### 추가 정보 요청 대응
심사팀에서 추가 정보를 요청할 수 있습니다:
- **Resolution Center**에서 메시지 확인
- 24-48시간 내 응답 권장

---

## 문제 해결

### 빌드가 App Store Connect에 표시되지 않음
```bash
# 빌드 상태 확인
eas build:list

# 최근 빌드 상세 정보
eas build:view
```

### 빌드 번호 충돌
app.json의 buildNumber를 증가시키고 다시 빌드:

```json
{
  "expo": {
    "ios": {
      "buildNumber": "5"  // 다음 번호로 증가
    }
  }
}
```

### Expo 계정 로그인 문제
```bash
# 로그아웃 후 다시 로그인
eas logout
eas login
```

### 인증서 오류
```bash
# 인증서 재생성
eas credentials

# 또는 자동 관리 사용
# eas.json에서 "credentialsSource": "remote" 설정
```

---

## EAS Build 대신 수동 빌드 (대안)

EAS를 사용하지 않는 경우:

### 1. Xcode로 빌드

```bash
# 네이티브 프로젝트 생성
npx expo prebuild

# Xcode 열기
open ios/rezomcommunity.xcworkspace
```

### 2. Xcode에서 Archive
1. **Product** > **Scheme** > **Edit Scheme**
2. **Run** > **Build Configuration** > **Release** 선택
3. **Product** > **Archive**
4. Archive 완료 후 **Distribute App**
5. **App Store Connect** 선택
6. 업로드

---

## 참고 자료

### Expo/EAS 문서
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Submission](https://docs.expo.dev/submit/ios/)
- [EAS CLI Reference](https://docs.expo.dev/eas/cli/)

### Apple 문서
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight](https://developer.apple.com/testflight/)

---

## 예상 타임라인

| 단계 | 소요 시간 |
|------|-----------|
| 로컬 테스트 | 30분 - 1시간 |
| EAS 빌드 | 10-20분 |
| App Store Connect 업로드 | 5-10분 |
| 심사 대기 | 1-3일 |
| 심사 진행 | 1-2일 |
| **총 예상 시간** | **2-5일** |

---

## 체크리스트

배포 전 최종 확인:

- [ ] Supabase SQL 실행 완료
- [ ] 로컬에서 차단 기능 테스트 완료
- [ ] app.json의 buildNumber 확인 (현재: 4)
- [ ] EAS 로그인 완료
- [ ] Production 빌드 생성
- [ ] App Store Connect에 빌드 업로드 완료
- [ ] App Review Notes 작성 완료
- [ ] 심사 제출

---

**마지막 업데이트**: 2025-11-27
**배포 버전**: 1.0.0 (Build 4)
**목적**: App Store 재심사 (차단 기능 추가)
