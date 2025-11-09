# Localhost에서 Google 로그인 시 프로덕션으로 리다이렉트되는 문제 해결

## 문제 증상

localhost:5173에서 "Google로 계속하기" 클릭 시:
- ❌ www.tongchalbang.com으로 자동 리다이렉트
- ❌ localhost로 돌아오지 않음

## 원인

Supabase Dashboard의 Redirect URL 설정에 localhost가 없기 때문

## 해결 방법

### 1. Supabase Dashboard 설정

```
1. https://app.supabase.com 접속
2. 프로젝트 선택
3. Authentication > URL Configuration 메뉴
4. "Redirect URLs" 섹션 찾기
5. "Add URL" 버튼 클릭
```

**추가해야 할 URL들:**
```
http://localhost:5173/auth/callback
http://localhost:5173
```

6. "Save" 버튼 클릭

### 2. 현재 설정 확인

올바른 설정 예시:

**Site URL:**
```
https://www.tongchalbang.com
```

**Redirect URLs:**
```
http://localhost:5173
http://localhost:5173/auth/callback
https://www.tongchalbang.com
https://www.tongchalbang.com/auth/callback
```

### 3. 테스트

설정 변경 후:

```bash
# 1. 브라우저 완전히 종료

# 2. 다시 시작하고 localhost 접속
http://localhost:5173

# 3. F12 > Console 탭 열기

# 4. "Google로 계속하기" 클릭

# 5. 콘솔에서 확인:
# "OAuth Redirect URL: http://localhost:5173/auth/callback"

# 6. Google 로그인 후 localhost로 돌아오는지 확인
```

### 4. 여전히 프로덕션으로 리다이렉트되는 경우

**원인 1: 브라우저 캐시**
```
F12 > Application > Storage > Clear site data
Ctrl+Shift+R (하드 리프레시)
```

**원인 2: Supabase 설정 반영 시간**
- 설정 변경 후 최대 5분 정도 소요될 수 있음
- 잠시 기다린 후 다시 시도

**원인 3: Google Cloud Console 설정**
```
Google Cloud Console 확인:
1. https://console.cloud.google.com
2. APIs & Services > Credentials
3. OAuth 2.0 Client IDs 선택
4. Authorized redirect URIs 확인
5. Supabase callback URL이 있는지 확인:
   https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback
```

## 예상 동작 (정상)

1. localhost:5173에서 "Google로 계속하기" 클릭
2. Google 로그인 페이지로 이동
3. 계정 선택
4. **localhost:5173으로 리다이렉트** ✅
5. 로그인 완료

## 개발 vs 프로덕션

### 개발 환경 (localhost)
```javascript
window.location.origin
// → "http://localhost:5173"

redirectUrl
// → "http://localhost:5173/auth/callback"
```

### 프로덕션 환경
```javascript
window.location.origin
// → "https://www.tongchalbang.com"

redirectUrl
// → "https://www.tongchalbang.com/auth/callback"
```

코드는 자동으로 현재 환경을 감지하므로 별도 수정 불필요!

## 참고사항

- Redirect URL은 **정확히 일치**해야 함 (슬래시, 포트 번호 포함)
- Supabase는 설정된 URL만 허용 (보안상 이유)
- 여러 URL 추가 가능 (개발/스테이징/프로덕션 등)

## 문제 해결 체크리스트

- [ ] Supabase > Authentication > URL Configuration 확인
- [ ] Redirect URLs에 localhost:5173 추가됨
- [ ] 설정 저장함
- [ ] 브라우저 캐시 클리어함
- [ ] 콘솔에서 올바른 redirect URL 확인됨
- [ ] localhost로 정상 리다이렉트됨

모든 항목을 체크했는데도 문제가 계속되면, Supabase Support에 문의하거나
프로젝트 설정을 다시 확인해야 할 수 있습니다.
