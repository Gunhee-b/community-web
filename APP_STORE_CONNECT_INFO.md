# App Store Connect 정보 업데이트

## 🔴 중요: App Store Connect에서 다음 정보를 업데이트해야 합니다

### Support URL 변경
**이전:** `https://github.com/Gunhee-b/community-web/issues`
**변경 후:** 실제 Support 웹사이트 URL을 여기에 입력하세요

**임시 방법:**
GitHub Pages를 사용하여 SUPPORT.md를 호스팅할 수 있습니다:
1. GitHub 저장소 설정에서 GitHub Pages 활성화
2. SUPPORT.md를 웹에서 볼 수 있도록 설정
3. 생성된 URL을 App Store Connect에 입력

예: `https://gunhee-b.github.io/community-web/SUPPORT`

**권장 방법:**
별도의 웹사이트를 만들어 다음 정보를 포함:
- 앱 소개
- FAQ
- 문의 방법 (이메일: ingk.tech@gmail.com)
- 이용약관 링크
- 개인정보처리방침 링크

### App Store Connect 답변 (Guideline 1.5 대응)

심사팀에게 다음과 같이 답변하세요:

```
안녕하세요,

Support URL을 GitHub Issues에서 적절한 고객 지원 웹페이지로 변경했습니다.

새로운 Support URL: [여기에 실제 URL 입력]

이 페이지에는 다음 정보가 포함되어 있습니다:
- 앱 소개
- 자주 묻는 질문 (FAQ)
- 이메일 문의 방법 (ingk.tech@gmail.com)
- 이용약관 및 개인정보처리방침 링크

고객님들이 효과적으로 지원을 받을 수 있도록 구성했습니다.

감사합니다.
```

## 📱 App Store Connect 설정 체크리스트

### 1. App Information
- [x] Support URL 업데이트
- [x] Marketing URL (선택사항)

### 2. App Review Information
- [x] Sign-in 정보 제공 (테스트 계정 불필요 - 소셜 로그인)
- [x] Notes에 Sign in with Apple 추가 사실 명시

### 3. 심사팀에게 전달할 메시지

```
안녕하세요, App Review 팀,

이전 심사에서 지적하신 모든 사항을 수정했습니다:

1. **Guideline 4.8 - Login Services**
   ✅ Sign in with Apple을 추가했습니다
   - Apple, Google, Kakao 세 가지 로그인 옵션 제공
   - Apple 로그인은 이메일 비공개 기능 지원

2. **Guideline 5.1.1 - Account Deletion**
   ✅ 계정 삭제 기능을 구현했습니다
   - 위치: 설정 > 계정 관리 > 계정 삭제
   - 2단계 확인 절차로 실수 방지
   - 모든 사용자 데이터 즉시 삭제

3. **Guideline 1.2 - User-Generated Content**
   ✅ 모든 필수 안전장치를 구현했습니다:
   - 회원가입 시 이용약관 동의 (부적절한 콘텐츠 무관용 원칙 명시)
   - 콘텐츠 신고 기능
   - 사용자 차단 기능
   - 기본 욕설 필터링
   - 관리자 대시보드 (24시간 내 조치)

4. **Guideline 1.5 - Support URL**
   ✅ Support URL을 적절한 고객 지원 웹페이지로 변경했습니다

재심사를 부탁드립니다.
감사합니다.
```

---

**다음 단계:**
1. 위 변경사항을 App Store Connect에 적용
2. 새 빌드 업로드 (Build Number: 3)
3. 심사 제출
