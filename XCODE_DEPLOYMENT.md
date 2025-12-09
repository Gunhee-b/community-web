# Xcode를 통한 App Store 배포 가이드

Expo 프로젝트를 Xcode로 빌드하고 App Store에 제출하는 전체 과정입니다.

---

## ✅ 완료된 작업

- [x] `npx expo prebuild` 실행 완료
- [x] `ios/` 네이티브 프로젝트 생성
- [x] CocoaPods 설치 완료
- [x] Xcode 워크스페이스 생성

---

## 1단계: Xcode 프로젝트 열기

### Xcode 실행됨 ✅

다음 파일이 자동으로 열렸습니다:
```
ios/rezomcommunity.xcworkspace
```

> ⚠️ **중요**: `.xcodeproj`가 아닌 `.xcworkspace`를 열어야 합니다!

---

## 2단계: 프로젝트 설정 확인

### 1. 프로젝트 네비게이터에서 설정 열기

1. 좌측 프로젝트 네비게이터에서 **rezomcommunity** (최상위) 클릭
2. **TARGETS** > **rezomcommunity** 선택
3. **General** 탭 확인

### 2. 앱 정보 확인

다음 항목들이 올바른지 확인:

| 항목 | 값 | 상태 |
|------|-----|------|
| **Display Name** | Rezom | ✅ |
| **Bundle Identifier** | com.rezom.community | ✅ |
| **Version** | 1.0.0 | ✅ |
| **Build** | 4 | ✅ |

### 3. Signing & Capabilities 설정

1. **Signing & Capabilities** 탭 클릭
2. **Team** 선택:
   - Apple Developer 계정의 팀 선택
   - "Automatically manage signing" 체크
3. **Bundle Identifier** 확인: `com.rezom.community`

> ℹ️ Team이 없다면:
> - Xcode > Preferences > Accounts에서 Apple ID 추가
> - 또는 Apple Developer 유료 계정 필요

---

## 3단계: 빌드 설정 구성

### 1. Scheme 설정

1. 상단 툴바에서 **Product** > **Scheme** > **Edit Scheme...** 클릭
2. 좌측에서 **Run** 선택
3. **Build Configuration**: **Release** 선택
4. **Close** 클릭

### 2. 디바이스 선택

상단 툴바에서:
- **Any iOS Device (arm64)** 선택
- 또는 **Generic iOS Device** 선택

> ⚠️ 시뮬레이터가 아닌 **실제 디바이스** 또는 **Generic Device**를 선택해야 Archive 가능

---

## 4단계: Archive 생성

### 1. Clean Build (선택사항, 권장)

```
Product > Clean Build Folder (Shift + Cmd + K)
```

### 2. Archive 시작

```
Product > Archive (Cmd + Shift + B가 아님!)
```

> ⏱️ 빌드 시간: 약 5-10분 소요

### 3. Archive 진행 상황 확인

- 상단 중앙의 진행 표시줄 확인
- 빌드 로그: **View** > **Navigators** > **Show Report Navigator** (Cmd + 9)

### 4. Archive 완료

Archive가 성공하면 **Organizer** 창이 자동으로 열립니다.

---

## 5단계: App Store Connect 업로드

### Organizer 창에서:

1. 방금 생성된 Archive 선택 (가장 최근 날짜)
2. 우측의 **Distribute App** 버튼 클릭

### 배포 방법 선택:

1. **App Store Connect** 선택
2. **Next** 클릭

### 배포 옵션:

1. **Upload** 선택
2. **Next** 클릭

### 서명 옵션:

1. **Automatically manage signing** 선택 (권장)
2. **Next** 클릭

### 검토 및 업로드:

1. 앱 정보 확인:
   - Bundle ID: `com.rezom.community`
   - Version: `1.0.0 (4)`
2. **Upload** 버튼 클릭

> ⏱️ 업로드 시간: 약 5-10분 소요

### 업로드 완료:

"Upload Successful" 메시지가 표시되면 성공!

---

## 6단계: App Store Connect에서 확인

### 1. App Store Connect 접속

https://appstoreconnect.apple.com

### 2. 빌드 확인

1. **My Apps** > **Rezom** 선택
2. 좌측 **TestFlight** 클릭
3. **iOS Builds** 섹션에서 새 빌드 확인

> ⚠️ 빌드가 표시되기까지 **5-15분** 소요될 수 있습니다.

### 3. 빌드 처리 상태

빌드 상태 변화:
1. **Processing** (처리 중) - 5-15분
2. **Ready to Submit** (제출 준비 완료)

---

## 7단계: 심사 제출

### 1. 앱 버전 준비

1. 좌측 메뉴에서 **App Store** 클릭
2. **+ 버전 또는 플랫폼** 클릭 (기존 버전이 있다면 해당 버전 선택)
3. 버전 번호 입력: `1.0.0`

### 2. 빌드 선택

1. **빌드** 섹션에서 **+ 버전 추가** 클릭
2. 방금 업로드한 빌드 **1.0.0 (4)** 선택

### 3. App Review Information 업데이트

**Notes (심사 노트)** 추가:

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

### 4. 심사 제출

1. 모든 정보 확인
2. 우측 상단 **심사에 추가** 클릭
3. **제출** 버튼 클릭

---

## 8단계: 심사 진행 상황 모니터링

### 심사 상태 변화

1. **Waiting for Review** (심사 대기 중)
   - 보통 1-3일 소요

2. **In Review** (심사 중)
   - 보통 1-2일 소요

3. **Pending Developer Release** (승인됨)
   - 수동 출시 설정인 경우
   - **출시** 버튼 클릭하여 배포

4. **Ready for Sale** (판매 준비 완료)
   - 앱이 App Store에 출시됨 🎉

---

## 문제 해결

### ❌ Signing 오류

**증상**: "Failed to register bundle identifier"

**해결**:
1. Xcode > Preferences > Accounts
2. Apple ID 로그인 확인
3. Team 선택 확인
4. Bundle Identifier가 App Store Connect와 일치하는지 확인

---

### ❌ Archive 버튼이 비활성화됨

**원인**: 시뮬레이터가 선택됨

**해결**:
1. 상단 툴바에서 디바이스 선택
2. **Any iOS Device** 또는 **Generic iOS Device** 선택

---

### ❌ CocoaPods 오류

**증상**: "Unable to find a specification for..."

**해결**:
```bash
cd ios
pod install --repo-update
cd ..
```

---

### ❌ Build 실패

**해결**:
```bash
# Clean 후 다시 prebuild
rm -rf ios
npx expo prebuild --platform ios --clean
```

---

## 빌드 번호 증가 (다음 제출용)

다음 제출 시 빌드 번호를 증가시켜야 합니다:

### 1. app.json 수정
```json
{
  "expo": {
    "ios": {
      "buildNumber": "5"  // 4 → 5로 증가
    }
  }
}
```

### 2. 다시 prebuild
```bash
npx expo prebuild --platform ios --clean
```

### 3. Xcode에서 확인
- General 탭에서 Build 번호가 5로 업데이트되었는지 확인

---

## 체크리스트

배포 전 최종 확인:

- [ ] Xcode 워크스페이스 열림 (`.xcworkspace`)
- [ ] Bundle ID 확인: `com.rezom.community`
- [ ] Version 확인: `1.0.0`
- [ ] Build 확인: `4`
- [ ] Team 선택 완료
- [ ] Scheme을 Release로 설정
- [ ] Any iOS Device 선택
- [ ] Archive 생성 완료
- [ ] App Store Connect 업로드 완료
- [ ] 빌드 처리 완료 (TestFlight에서 확인)
- [ ] 심사 노트 작성 완료
- [ ] 심사 제출 완료

---

## 타임라인

| 단계 | 소요 시간 |
|------|-----------|
| Xcode 설정 | 5분 |
| Archive 생성 | 5-10분 |
| 업로드 | 5-10분 |
| 빌드 처리 (App Store Connect) | 5-15분 |
| 심사 대기 | 1-3일 |
| 심사 진행 | 1-2일 |
| **총 예상** | **2-5일** |

---

## 다음 단계

배포 후:

1. **TestFlight 테스트** (선택사항)
   - TestFlight에서 베타 테스트 가능
   - 내부 테스터 추가하여 최종 확인

2. **심사 승인 대기**
   - Resolution Center에서 메시지 확인
   - 추가 정보 요청 시 빠르게 응답

3. **승인 후 출시**
   - 수동 출시 설정이면 "출시" 버튼 클릭
   - 자동 출시 설정이면 자동으로 배포됨

---

**작성일**: 2025-11-27
**앱 버전**: 1.0.0 (Build 4)
**목적**: App Store 재심사 (차단 기능 추가)
