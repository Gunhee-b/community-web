# Xcode로 실제 iPhone에 앱 빌드하기

> "No script url provided" 에러 해결 포함

## 📋 목차

1. [Xcode 프로젝트 설정](#1-xcode-프로젝트-설정)
2. [Signing & Capabilities 설정](#2-signing--capabilities-설정)
3. [Build Settings 설정](#3-build-settings-설정)
4. [Info.plist 설정 확인](#4-infoplist-설정-확인)
5. [Metro 번들러 연결 문제 해결](#5-metro-번들러-연결-문제-해결)
6. [빌드 및 실행](#6-빌드-및-실행)
7. [문제 해결](#7-문제-해결)

---

## 1. Xcode 프로젝트 설정

### 1-1. 프로젝트 열기

```bash
# iOS 네이티브 프로젝트가 없다면 먼저 생성
npx expo prebuild --platform ios

# Xcode로 워크스페이스 열기
open ios/rezomcommunity.xcworkspace
```

⚠️ **중요**: `.xcodeproj`가 아닌 `.xcworkspace` 파일을 열어야 합니다!

### 1-2. 프로젝트 구조 확인

Xcode 왼쪽 네비게이터에서 확인:
```
📁 rezomcommunity (프로젝트)
  📁 rezomcommunity (타겟)
  📁 Pods
```

---

## 2. Signing & Capabilities 설정

### 2-1. General 탭

1. **프로젝트 선택**
   - 왼쪽 네비게이터에서 최상단 `rezomcommunity` (파란색 아이콘) 클릭

2. **Target 선택**
   - TARGETS 섹션에서 `rezomcommunity` 선택

3. **Identity 섹션**
   - **Display Name**: `Rezom Community`
   - **Bundle Identifier**: `com.rezom.community`
   - **Version**: `1.0.0`
   - **Build**: `1`

### 2-2. Signing & Capabilities 탭

1. **Automatically manage signing 체크**
   ```
   ✅ Automatically manage signing
   ```

2. **Team 선택**
   - **Apple Developer Program 가입자**: 팀 선택
   - **개인 개발자**: "Add Account" → Apple ID 로그인 → Personal Team 선택

3. **Provisioning Profile**
   - Team 선택 후 자동 생성됨
   - `Xcode Managed Profile` 표시되면 정상

4. **Bundle Identifier 충돌 시**
   - `com.rezom.community`가 사용 중이면
   - `com.yourname.rezomcommunity` 형태로 변경

### 2-3. URL Schemes 확인

**Signing & Capabilities** 탭에서:

1. **+ Capability** 버튼 클릭
2. "Associated Domains" 추가 (선택사항)
3. **Info** 탭으로 이동
4. **URL Types** 섹션 확인:
   ```
   URL Schemes:
   - rezom
   - kakao57450a0289e45de479273c9fc168f4fb
   ```

---

## 3. Build Settings 설정

### 3-1. Build Configuration

1. **Target 선택**: `rezomcommunity`
2. **Build Settings** 탭 클릭
3. **검색창에 "bundle"** 입력
4. **Product Bundle Identifier** 확인:
   ```
   com.rezom.community
   ```

### 3-2. Deployment Target

검색창에 "deployment" 입력:
- **iOS Deployment Target**: `13.4` 이상

### 3-3. Swift Compiler 설정

검색창에 "swift" 입력:
- **Swift Language Version**: Swift 5

---

## 4. Info.plist 설정 확인

### 4-1. Info.plist 위치

`rezomcommunity/Supporting/Expo.plist` 또는 `rezomcommunity/Info.plist`

### 4-2. 필수 설정 확인

Xcode에서 **Info** 탭 또는 Info.plist 파일을 직접 열어서 확인:

```xml
<!-- Bundle Identifier -->
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>

<!-- URL Schemes (소셜 로그인용) -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>kakao57450a0289e45de479273c9fc168f4fb</string>
    </array>
  </dict>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>rezom</string>
    </array>
  </dict>
</array>

<!-- Kakao/Naver 앱 실행을 위한 Scheme -->
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>kakaokompassauth</string>
  <string>kakaolink</string>
  <string>naversearchapp</string>
  <string>naversearchthirdlogin</string>
</array>

<!-- 네트워크 보안 (개발용) -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>localhost</key>
    <dict>
      <key>NSExceptionAllowsInsecureHTTPLoads</key>
      <true/>
    </dict>
  </dict>
</dict>
```

---

## 5. Metro 번들러 연결 문제 해결

### ❌ "No script url provided" 에러

이 에러는 앱이 Metro 번들러에 연결할 수 없을 때 발생합니다.

### 5-1. Metro 서버 실행 (필수!)

**별도 터미널에서**:

```bash
cd /path/to/vote-example/app
npm start

# 또는 특정 포트로 실행
npm start -- --port 8081
```

서버가 정상 실행되면:
```
Metro waiting on exp://192.168.x.x:8081
```

### 5-2. 앱 재빌드 및 실행

1. **Xcode에서 앱 정지** (Stop 버튼)
2. **Clean Build Folder**
   - Xcode 메뉴: `Product` → `Clean Build Folder` (Cmd + Shift + K)
3. **앱 재실행**
   - `Product` → `Run` (Cmd + R)

### 5-3. 네트워크 연결 확인

#### iPhone과 Mac이 같은 Wi-Fi에 연결되어 있는지 확인:

1. **Mac의 IP 주소 확인**:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   예: `inet 192.168.1.100`

2. **iPhone에서 앱 실행 시**:
   - 앱이 Metro 서버 URL을 자동으로 찾음
   - 또는 직접 입력: `http://192.168.1.100:8081`

### 5-4. 수동 번들 URL 설정 (필요시)

앱이 자동으로 Metro를 찾지 못하면:

1. **앱 실행 후 Shake (흔들기)**
2. **개발자 메뉴 열기**
3. **"Debug server host & port for device"** 선택
4. **Mac의 IP와 포트 입력**:
   ```
   192.168.1.100:8081
   ```
5. **앱 재시작**

### 5-5. Expo 개발 클라이언트 방식 (권장)

더 안정적인 방법:

```bash
# 개발 빌드 실행
npx expo run:ios --device

# 자동으로 Metro 서버 연결됨
```

---

## 6. 빌드 및 실행

### 6-1. 디바이스 선택

1. **iPhone을 Mac에 USB로 연결**
2. **Xcode 상단 중앙**: 디바이스 선택 드롭다운
3. **실제 iPhone 선택** (예: "배의 iPhone")

### 6-2. 신뢰 설정 (처음이라면)

iPhone에서:
```
"이 컴퓨터를 신뢰하시겠습니까?"
→ 신뢰 클릭
→ iPhone 암호 입력
```

### 6-3. 빌드 및 실행

1. **Xcode에서 빌드**:
   - `Product` → `Run` (Cmd + R)
   - 또는 상단 ▶️ 버튼 클릭

2. **빌드 진행 확인**:
   - Xcode 상단 중앙에 진행률 표시
   - 보통 1-3분 소요

3. **iPhone에 앱 설치**

### 6-4. 개발자 신뢰 설정

iPhone에서 처음 실행 시:

```
"신뢰할 수 없는 개발자" 에러 발생
```

**해결**:
1. **iPhone 설정** 앱 열기
2. **일반** → **VPN 및 기기 관리**
3. **개발자 앱** 섹션에서 본인 Apple ID 선택
4. **"[본인 Apple ID]을(를) 신뢰"** 클릭
5. **앱 다시 실행**

---

## 7. 문제 해결

### 7-1. "No script url provided" 에러

**원인**: Metro 번들러가 실행되지 않았거나 연결 불가

**해결**:
1. Metro 서버 실행 확인 (`npm start`)
2. iPhone과 Mac이 같은 Wi-Fi 연결 확인
3. 방화벽 확인 (Mac 시스템 환경설정 → 보안 및 개인 정보 보호 → 방화벽)
4. Xcode에서 Clean Build 후 재빌드

### 7-2. "Could not connect to development server"

**해결**:
1. Metro 서버 재시작
2. 앱에서 Shake → "Reload"
3. IP 주소 수동 입력 (위 5-4 참조)

### 7-3. "Provisioning profile doesn't include signing certificate"

**해결**:
1. Xcode Preferences → Accounts
2. Apple ID 선택 → "Download Manual Profiles" 클릭
3. Signing & Capabilities에서 Team 다시 선택

### 7-4. "App installation failed"

**원인**: iPhone 저장 공간 부족 또는 이전 빌드 충돌

**해결**:
1. iPhone에서 이전 앱 삭제
2. iPhone 재시작
3. Xcode에서 Clean Build (Cmd + Shift + K)
4. 다시 빌드

### 7-5. 빌드 에러 (CocoaPods 관련)

**해결**:
```bash
cd ios
pod deintegrate
pod install
```

그 후 Xcode에서 다시 빌드

---

## 🎯 빌드 성공 체크리스트

- [ ] Xcode에서 `.xcworkspace` 파일 열림
- [ ] Team이 올바르게 선택됨
- [ ] Bundle Identifier 충돌 없음
- [ ] iPhone이 USB로 연결되어 있음
- [ ] iPhone에서 Mac을 신뢰함
- [ ] Metro 서버가 실행 중 (`npm start`)
- [ ] iPhone과 Mac이 같은 Wi-Fi에 연결
- [ ] iPhone에서 개발자 앱 신뢰 설정 완료
- [ ] 앱이 Metro 서버에 연결됨

---

## 🚀 빠른 시작 (요약)

```bash
# 1. Metro 서버 실행
npm start

# 2. 다른 터미널에서 iOS 빌드 (권장)
npx expo run:ios --device

# 또는 Xcode 사용
open ios/rezomcommunity.xcworkspace
# Xcode에서 디바이스 선택 후 Cmd + R
```

---

## 📚 참고 자료

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Xcode Guide](https://developer.apple.com/documentation/xcode/)

---

**작성일**: 2025-11-15
**업데이트**: Metro 번들러 연결 문제 해결 추가
