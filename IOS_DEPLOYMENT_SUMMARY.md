# Rezom iOS App Store 배포 작업 요약

## 앱 정보

| 항목 | 값 |
|------|-----|
| 앱 이름 | Rezom |
| 번들 ID | com.rezom.community |
| 버전 | 1.0.0 |
| 빌드 번호 | 2 |
| Apple ID | 6755453695 |
| SKU | com.rezom.community |
| Team ID | UH62KGWPZA |

---

## 1. 사전 준비

### 환경 확인
- **macOS**: 최신 버전
- **Xcode**: 최신 버전
- **Command Line Tools**: 버전 2410
- **CocoaPods**: 버전 1.16.2
- **Expo SDK**: 54.0.23
- **React Native**: New Architecture 활성화

### Apple Developer Program
- 개인 개발자 계정 등록 완료
- 결제 정보 등록 완료
- Team ID 확인 완료

---

## 2. 기술적 설정

### app.json 설정
```json
{
  "expo": {
    "name": "Rezom",
    "slug": "rezom-community",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.rezom.community",
      "buildNumber": "2",
      "supportsTablet": false,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "프로필 사진 및 게시물 이미지를 업로드하기 위해 사진 라이브러리에 접근합니다.",
        "NSCameraUsageDescription": "프로필 사진을 촬영하기 위해 카메라에 접근합니다.",
        "NSPhotoLibraryAddUsageDescription": "촬영한 사진을 저장하기 위해 사진 라이브러리에 접근합니다."
      }
    }
  }
}
```

### Info.plist 추가 설정
- **ITSAppUsesNonExemptEncryption**: false (표준 암호화만 사용)
- **Privacy 설명**: 한글로 작성
- **디바이스 지원**: iPhone 전용 (TARGETED_DEVICE_FAMILY = 1)

### App Icon 설정
iPhone 전용 아이콘 구성:
- 20x20 @2x (40px), @3x (60px)
- 29x29 @2x (58px), @3x (87px)
- 40x40 @2x (80px), @3x (120px)
- 60x60 @2x (120px), @3x (180px)
- 1024x1024 (App Store)

---

## 3. Apple Developer 계정 설정

### 인증서 및 프로비저닝
1. **Distribution Certificate** 생성 (수동)
2. **App Store Distribution Provisioning Profile** 생성
3. Xcode에서 Development Team 설정: UH62KGWPZA

---

## 4. 보안 점검

### Git History 정리
- BFG Repo-Cleaner로 .env 파일 삭제
- 노출된 민감 정보:
  - Supabase URL/Anon Key
  - Kakao Client ID/Secret

### 조치 사항
- Kakao Client Secret 재발급
- Git history 강제 push
- 저장소 public 전환

### npm 보안
- `npm audit fix` 실행
- 2개 취약점 수정 완료
- 1개 경미한 취약점 존재 (nanoid)

---

## 5. App Store Connect 메타데이터

### 기본 정보
- **앱 이름**: Rezom
- **부제**: (선택사항)
- **카테고리**: 소셜 네트워킹 / 라이프스타일

### 프로모션 텍스트
```
우리 아파트만의 소통 공간, Rezom에서 이웃과 함께하세요.
```

### 설명
```
Rezom은 아파트 입주민을 위한 커뮤니티 앱입니다.

주요 기능:
- 아파트 커뮤니티 게시판: 공지사항, 자유게시판, 중고거래 등 다양한 주제로 이웃과 소통
- 투표 기능: 아파트 주요 안건에 대해 입주민 의견을 투표로 수렴
- 실시간 알림: 중요한 공지사항과 새 게시글을 즉시 확인
- 간편한 소셜 로그인: Google, Kakao 계정으로 빠르게 시작

Rezom과 함께 더 나은 아파트 생활을 만들어가세요.
```

### 키워드
```
아파트,커뮤니티,입주민,이웃,게시판,투표,공지,중고거래,소통
```

### 지원 URL
https://github.com/Gunhee-b/community-web/issues

### 저작권
2025 Rezom

---

## 6. 개인정보 처리방침

### URL
https://github.com/Gunhee-b/community-web/blob/main/PRIVACY_POLICY.md

### 주요 내용
- 수집하는 개인정보: 이메일, 닉네임, 프로필 이미지
- 수집 목적: 회원 식별, 서비스 제공
- 보관 기간: 회원 탈퇴 시 즉시 파기
- 제3자 제공: 없음
- 문의처: ingk.tech@gmail.com

---

## 7. 테스트 계정

### Google 계정
- **이메일**: rezomtest@gmail.com
- **비밀번호**: App Store Connect에 입력됨

### 참고
- 앱은 소셜 로그인(Google, Kakao)만 지원
- Supabase 데모 계정 불필요

---

## 8. 빌드 및 업로드

### Build #1
- 업로드 성공
- dSYM 심볼 업로드 실패 경고 (무시 가능)

### Build #2 (최종)
1. `buildNumber`를 "2"로 증가
2. `npx expo prebuild --clean` 실행
3. AppIcon 파일 복원
4. `pod install` 실행
5. Xcode에서 Archive 및 업로드

---

## 9. 수출 규정 준수

### 암호화 알고리즘
- **선택**: "위에 언급된 알고리즘에 모두 해당하지 않음"
- **사유**: 앱 자체 암호화 구현 없음, iOS 표준 암호화만 사용 (HTTPS, OAuth)

---

## 10. 발생한 문제 및 해결

### 문제 1: Hermes/React Framework rsync 에러
```
hermes.xcframework files not found
```
**해결**: `cd ios && rm -rf Pods Podfile.lock && pod install`

### 문제 2: Upload Symbols Failed
```
dSYM for React.framework, hermes.framework
```
**해결**: 경고일 뿐 에러 아님. 앱 기능에 영향 없음.

### 문제 3: expo prebuild 후 AppIcon 초기화
**해결**: AppIcon 파일 재복사 및 Contents.json 재설정

### 문제 4: Git History에 민감 정보 노출
**해결**: BFG Repo-Cleaner로 삭제, API 키 재발급

---

## 11. GitHub 설정

### Issue Templates
- `bug_report.md`: 버그 리포트 템플릿
- `feature_request.md`: 기능 요청 템플릿

### 저장소 상태
- Public으로 전환 완료
- 민감 정보 제거 완료

---

## 12. 주요 파일 위치

| 파일 | 경로 |
|------|------|
| app.json | `/app/app.json` |
| Info.plist | `/app/ios/RezomCommunity/Info.plist` |
| App Icon | `/app/ios/RezomCommunity/Images.xcassets/AppIcon.appiconset/` |
| 개인정보처리방침 | `/PRIVACY_POLICY.md` |
| 앱 상수 | `/app/constants/app.ts` |

---

## 13. 다음 단계

### 심사 대기
- **예상 기간**: 24-48시간 (최대 1-3일)

### 심사 결과에 따른 조치
- **승인**: App Store에 자동 출시
- **거절**: 거절 사유 확인 후 수정 및 재제출

### 향후 업데이트 시
1. `version` 또는 `buildNumber` 증가
2. `npx expo prebuild` 실행
3. Xcode에서 Archive 및 업로드
4. App Store Connect에서 새 버전 제출

---

## 14. 참고 자료

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Expo iOS Distribution](https://docs.expo.dev/distribution/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

---

**작성일**: 2025년 11월 19일
**제출 상태**: App Store 심사 대기 중
