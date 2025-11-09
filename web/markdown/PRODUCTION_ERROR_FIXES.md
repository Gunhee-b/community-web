# 🔧 프로덕션 에러 해결 가이드

**작성일**: 2025-11-07
**상태**: 발견된 에러 및 해결 방법

---

## 🚨 발견된 에러

배포 환경 (`https://www.tongchalbang.com`)에서 발견된 콘솔 에러:

```
1. Kakao sign-in error: Error: Kakao Client ID is not configured
2. Error while trying to use the following icon from the Manifest:
   https://www.tongchalbang.com/pwa-192x192.png (Download error or resource isn't a valid image)
3. <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated.
   Please include <meta name="mobile-web-app-capable" content="yes">
```

---

## ✅ 해결 방법

### 1️⃣ **가장 중요: Kakao 환경 변수 오류**

#### 🔴 문제
```
Kakao sign-in error: Error: Kakao Client ID is not configured
```

#### 📋 원인
Vercel 환경 변수가 빌드 시 제대로 주입되지 않았습니다.

#### ✅ 해결 방법

**Step 1: Vercel 환경 변수 확인**

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 (`tongchalbang`)
3. **Settings** → **Environment Variables**
4. 다음 변수들이 **정확히** 입력되어 있는지 확인:

```bash
변수명: VITE_KAKAO_CLIENT_ID
값: 57450a0289e45de479273c9fc168f4fb
환경: Production ✅, Preview ✅, Development ✅

변수명: VITE_KAKAO_CLIENT_SECRET
값: 8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9
환경: Production ✅, Preview ✅, Development ✅
```

**⚠️ 주의사항**:
- 변수명이 정확히 `VITE_KAKAO_CLIENT_ID` (대문자)
- 앞에 `VITE_`가 **반드시** 있어야 함 (Vite 필수)
- 값에 따옴표(`"`) **없이** 입력
- **모든 환경** 체크 (Production, Preview, Development)

**Step 2: 재배포**

환경 변수를 추가/수정한 후:

1. Vercel Dashboard → **Deployments** 탭
2. 최신 배포 항목의 **⋯** (점 3개) 클릭
3. **Redeploy** 선택
4. **Redeploy** 확인

또는 Git push:
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

**Step 3: 배포 후 확인**

1. 배포 완료 후 사이트 접속: `https://www.tongchalbang.com`
2. 로그인 페이지로 이동
3. 브라우저 개발자 도구 열기 (F12)
4. **Console** 탭 확인
5. "카카오로 계속하기" 버튼 클릭
6. 에러 없이 Kakao 로그인 페이지로 이동하는지 확인

**확인 방법 (Console에서)**:
```javascript
// 개발자 도구 Console에서 실행
console.log(import.meta.env.VITE_KAKAO_CLIENT_ID)
// 결과: "57450a0289e45de479273c9fc168f4fb" 출력되어야 함
// undefined가 나오면 환경 변수 설정 안 된 것
```

---

### 2️⃣ **PWA 아이콘 404 에러**

#### 🔴 문제
```
Error while trying to use the following icon from the Manifest:
https://www.tongchalbang.com/pwa-192x192.png (Download error)
```

#### 📋 원인
`public/` 폴더에 PWA 아이콘 파일들이 없습니다.

현재 상황:
```
public/
├── vite.svg (있음)
└── (pwa-192x192.png 없음)
└── (pwa-512x512.png 없음)
```

#### ✅ 해결 방법

**Option 1: Capacitor Assets로 자동 생성 (권장)**

1. **원본 이미지 준비** (1024x1024 PNG):
   ```bash
   # assets 폴더 생성
   mkdir -p assets

   # icon.png 파일을 assets 폴더에 넣기
   # (1024x1024 PNG 이미지)
   ```

2. **자동 생성**:
   ```bash
   npm run cap:assets
   ```

   이 명령어가 자동으로 생성:
   - `public/pwa-192x192.png`
   - `public/pwa-512x512.png`
   - `public/apple-touch-icon.png`
   - 기타 모든 크기의 아이콘

**Option 2: 임시로 에러 숨기기** (빠른 해결)

PWA 기능을 당장 사용하지 않는다면:

`vite.config.js` 수정:
```javascript
VitePWA({
  registerType: 'autoUpdate',
  // 아이콘 파일이 없을 때 에러 방지
  includeAssets: [],  // 빈 배열로 변경
  manifest: false,    // manifest 비활성화
  // ... 나머지 설정 주석 처리
})
```

그리고 재배포:
```bash
git add vite.config.js
git commit -m "Temporarily disable PWA icons"
git push origin main
```

**Option 3: 수동으로 아이콘 생성**

온라인 도구 사용:
1. https://realfavicongenerator.net/ 접속
2. 원본 이미지 업로드
3. 모든 아이콘 다운로드
4. `public/` 폴더에 복사:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`

---

### 3️⃣ **Deprecated Meta Tag 경고**

#### 🔴 문제
```
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated.
Please include <meta name="mobile-web-app-capable" content="yes">
```

#### 📋 원인
Chrome이 새로운 표준 meta 태그를 권장합니다.

#### ✅ 해결 방법 (✅ 이미 수정됨)

`index.html` 파일이 다음과 같이 수정되었습니다:

**Before**:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
```

**After**:
```html
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

이제 양쪽 모두 포함되어 경고가 사라집니다.

---

## 🎯 우선순위 순서

### 🔥 즉시 해결 필요 (높음)

1. **Kakao 환경 변수 설정** ← **가장 중요!**
   - Vercel에서 환경 변수 확인 및 추가
   - 재배포
   - 예상 시간: 5분

### ⚠️ 조만간 해결 (중간)

2. **PWA 아이콘 생성**
   - 원본 이미지 준비
   - `npm run cap:assets` 실행
   - 예상 시간: 10-15분

### ✅ 해결 완료 (낮음)

3. **Deprecated meta tag** ← 이미 수정됨
   - `index.html` 파일 수정 완료
   - 다음 배포에 자동 반영

---

## 📊 해결 후 확인 사항

### ✅ 체크리스트

Kakao 환경 변수 수정 후 확인:
- [ ] Vercel에서 재배포 완료
- [ ] `https://www.tongchalbang.com` 접속
- [ ] 개발자 도구(F12) → Console 탭 열기
- [ ] "카카오로 계속하기" 버튼 클릭
- [ ] 에러 메시지 없이 Kakao 로그인 페이지로 이동
- [ ] 로그인 완료 후 사이트로 정상 리다이렉트

PWA 아이콘 생성 후 확인:
- [ ] `public/pwa-192x192.png` 파일 존재
- [ ] `public/pwa-512x512.png` 파일 존재
- [ ] Git commit 및 push
- [ ] 재배포 후 Console에서 404 에러 사라짐

---

## 🔍 추가 디버깅 방법

### Vercel 빌드 로그 확인

1. Vercel Dashboard → **Deployments**
2. 최신 배포 클릭
3. **Building** 섹션 확인
4. 환경 변수가 제대로 로드되는지 확인:
   ```
   VITE_KAKAO_CLIENT_ID: 57450a0289e45de479273c9fc168f4fb
   VITE_SUPABASE_URL: https://wghrshqnexgaojxrtiit.supabase.co
   ```

### 프로덕션에서 환경 변수 확인

사이트에 접속 후 개발자 도구 Console에서:
```javascript
// 모든 환경 변수 확인
console.log({
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  KAKAO_CLIENT_ID: import.meta.env.VITE_KAKAO_CLIENT_ID,
  // Secret은 절대 출력하지 마세요!
})
```

예상 출력:
```javascript
{
  SUPABASE_URL: "https://wghrshqnexgaojxrtiit.supabase.co",
  KAKAO_CLIENT_ID: "57450a0289e45de479273c9fc168f4fb"
}
```

만약 `undefined`가 나온다면:
→ Vercel 환경 변수가 설정되지 않았거나 재배포가 필요합니다.

---

## 📞 여전히 문제가 있나요?

### 자주 묻는 질문

**Q: 환경 변수를 추가했는데도 undefined가 나와요**
A: 환경 변수 추가/수정 후 **반드시 재배포**해야 합니다. Git push만으로는 환경 변수가 반영되지 않습니다.

**Q: Kakao 로그인은 언제 작동하나요?**
A: 환경 변수 설정 → 재배포 → 완료 후 즉시 작동합니다.

**Q: PWA 아이콘이 없어도 사이트가 작동하나요?**
A: 네, 작동합니다. PWA 아이콘은 홈 화면에 추가할 때만 사용됩니다. 하지만 Console에 404 에러가 계속 표시됩니다.

**Q: 환경 변수를 변경하면 보안에 문제가 있나요?**
A: `VITE_*` 환경 변수는 클라이언트 측에 노출되므로 민감한 정보(비밀번호, Private Key 등)는 절대 넣지 마세요. Kakao Client ID는 공개되어도 안전합니다 (Client Secret는 별도 보호).

---

## 🎉 완료!

모든 단계를 완료하면:
- ✅ Kakao 로그인 정상 작동
- ✅ Console 에러 모두 제거
- ✅ PWA 기능 정상 작동

---

**작성자**: Claude Code
**최종 업데이트**: 2025-11-07
**버전**: 1.0.0
