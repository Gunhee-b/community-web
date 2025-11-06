# Xcode 로딩 느림 문제 해결 가이드

## 현재 상황 분석

Xcode가 프로젝트를 로딩하는 중입니다. 다음과 같은 프로세스가 실행 중입니다:
- ✅ Xcode 메인 프로세스
- ✅ xcodebuild (프로젝트 분석 중)
- ✅ SourceKit (코드 인덱싱)
- ✅ Source Control Scanner (Git 분석)

**이것은 정상적인 첫 실행 과정입니다!**

---

## 일반적인 원인

### 1. 첫 실행 시 인덱싱 (가장 흔함)
Xcode가 처음 프로젝트를 열 때:
- 📁 모든 파일 인덱싱
- 🔍 코드 자동완성 데이터 생성
- 📦 의존성 분석
- 🔗 심볼 링크 구축

**시간:** 5~15분 (프로젝트 크기에 따라)

### 2. node_modules 스캔
- 📦 570MB 이상의 node_modules 폴더를 Xcode가 스캔
- Git 상태 확인 프로세스가 느림

### 3. Derived Data 캐시
- 오래된 캐시가 충돌 발생

---

## 즉시 해결 방법

### 방법 1: 그냥 기다리기 (추천 - 첫 실행 시)

**Xcode 상단을 확인하세요:**
- "Indexing..." 또는 "Processing..." 메시지가 보이나요?
- 진행률 표시가 있나요?

**대기 시간:**
- 인덱싱: 5~10분
- 첫 빌드: 3~5분

**기다리는 동안:**
```bash
# 터미널에서 인덱싱 진행 상황 확인
tail -f ~/Library/Developer/Xcode/DerivedData/*/Logs/Build/*.xcactivitylog
```

---

### 방법 2: node_modules 무시하기 (매우 효과적!)

Xcode가 node_modules를 스캔하지 않도록 설정:

#### .gitignore에 이미 node_modules가 있는지 확인
```bash
cat .gitignore | grep node_modules
```

#### Xcode에서 직접 제외
1. Xcode에서 왼쪽 Project Navigator 확인
2. `node_modules` 폴더가 보인다면:
   - 폴더 선택 → 오른쪽 클릭 → **Delete** → **Remove Reference**
3. Xcode 재시작

---

### 방법 3: Xcode 캐시 삭제 후 재시작

#### 1. Xcode 완전히 종료
```bash
killall Xcode
killall xcodebuild
killall SourceKit
```

#### 2. Derived Data 삭제
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

#### 3. iOS 프로젝트 캐시 삭제
```bash
cd /Users/baegeonhui/Documents/Programming/vote-example/ios/App
rm -rf Build
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
```

#### 4. Xcode 재실행
```bash
open /Users/baegeonhui/Documents/Programming/vote-example/ios/App/App.xcworkspace
```

---

### 방법 4: Pod 캐시 정리 후 재설치

```bash
cd /Users/baegeonhui/Documents/Programming/vote-example/ios/App

# Pod 캐시 삭제
rm -rf Pods
rm -rf ~/Library/Caches/CocoaPods
rm Podfile.lock

# 재설치
pod install

# Xcode 실행
open App.xcworkspace
```

---

### 방법 5: 터미널에서 직접 빌드 (Xcode 없이 테스트)

Xcode GUI가 너무 느리면 터미널에서 직접 빌드:

```bash
cd /Users/baegeonhui/Documents/Programming/vote-example

# iOS 시뮬레이터용 빌드
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

빌드가 성공하면:
```bash
# 시뮬레이터 부팅
xcrun simctl boot "iPhone 15 Pro"

# 앱 설치 및 실행
xcrun simctl install booted ios/App/build/Debug-iphonesimulator/App.app
xcrun simctl launch booted com.tongchalban.community
```

---

## 성능 최적화 (영구적 해결)

### 1. .gitignore 최적화

프로젝트 루트의 `.gitignore`에 추가:
```
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Xcode (이미 있을 수 있음)
ios/App/Build/
ios/App/Pods/
ios/App/*.xcworkspace/xcuserdata/
ios/App/*.xcodeproj/xcuserdata/
ios/DerivedData/

# Android
android/build/
android/app/build/
android/.gradle/
```

### 2. Xcode 설정 최적화

#### a) 인덱싱 최적화
Xcode 메뉴:
1. **Preferences** (⌘,)
2. **Locations** 탭
3. **Derived Data**: Custom 경로 설정 (SSD 추천)

#### b) Source Control 비활성화 (선택사항)
Xcode 메뉴:
1. **Preferences** (⌘,)
2. **Source Control** 탭
3. **Enable source control** 체크 해제

#### c) 빌드 시스템 변경
Xcode 메뉴:
1. **File → Project Settings**
2. **Build System**: **New Build System** (기본) 유지

---

## 현재 상태 확인 명령어

### Xcode 프로세스 확인
```bash
ps aux | grep -i xcode | grep -v grep
```

### 인덱싱 진행률 확인
```bash
# Xcode 로그 실시간 확인
log stream --predicate 'subsystem == "com.apple.dt.Xcode"' --level debug
```

### 디스크 I/O 확인 (느림의 원인 파악)
```bash
sudo fs_usage -w -f filesys Xcode
```

### 메모리 사용량 확인
```bash
top -pid $(pgrep Xcode)
```

---

## 대안: Android 먼저 테스트

iOS가 너무 느리면 Android를 먼저 테스트하세요:

```bash
# Android Studio 실행 (더 빠름)
npx cap open android
```

Android Studio는 일반적으로 Xcode보다 빠르게 로딩됩니다.

---

## 예상 로딩 시간

### 정상적인 경우
- **첫 실행**: 5~15분 (인덱싱)
- **두 번째 실행**: 30초~2분
- **이후**: 10~30초

### 느린 경우 (문제 있음)
- **첫 실행**: 30분 이상
- **지속적으로 느림**: 캐시 문제

---

## 빠른 체크리스트

현재 Xcode 화면을 확인하세요:

1. **상단 중앙**에 "Indexing..." 메시지가 있나요?
   - ✅ **예** → 정상! 기다리세요 (5~10분)
   - ❌ **아니오** → 다음 확인

2. **왼쪽 Project Navigator**에 node_modules가 보이나요?
   - ✅ **예** → 방법 2 적용 (node_modules 제외)
   - ❌ **아니오** → 다음 확인

3. **Activity Monitor**에서 Xcode 메모리 사용량?
   - 🟢 **< 4GB** → 정상
   - 🟡 **4~8GB** → 약간 느림
   - 🔴 **> 8GB** → 방법 3 적용 (캐시 삭제)

---

## 최종 권장사항

### 옵션 A: 인내심 (첫 실행이라면)
```bash
# 그냥 기다리세요. 커피 한잔 하세요 ☕
# Xcode가 인덱싱을 완료할 때까지 5~10분
```

### 옵션 B: 캐시 정리 (두 번째 이후인데 느리면)
```bash
# Xcode 종료
killall Xcode

# 캐시 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 재실행
open /Users/baegeonhui/Documents/Programming/vote-example/ios/App/App.xcworkspace
```

### 옵션 C: Android로 전환 (급하면)
```bash
# Android는 더 빠름
npx cap open android
```

---

## 문제가 계속되면

다음 정보를 확인하세요:

```bash
# Mac 사양 확인
system_profiler SPHardwareDataType | grep -E "Model|Processor|Memory"

# Xcode 버전
xcodebuild -version

# 디스크 여유 공간 (최소 20GB 필요)
df -h
```

메모리나 디스크 공간이 부족하면 Xcode가 매우 느려집니다.
