# Rezom Support Site

## 배포 방법

### Option 1: Vercel CLI로 배포 (권장)

1. Vercel CLI 설치 (이미 설치되어 있으면 생략):
```bash
npm install -g vercel
```

2. 이 디렉토리에서 배포:
```bash
cd support-site
vercel --prod
```

3. 배포 중 질문에 답변:
   - Set up and deploy?: `Y`
   - Which scope?: 본인 계정 선택
   - Link to existing project?: `N`
   - Project name: `rezom-support`
   - In which directory is your code located?: `./` (엔터)

4. 배포 완료 후 URL 확인:
   - 기본 URL: `https://rezom-support.vercel.app` 또는 유사한 형태
   - 프로젝트 설정에서 도메인 이름을 `rezom-support`로 변경 가능

### Option 2: Vercel Dashboard로 배포

1. https://vercel.com 로그인
2. "New Project" 클릭
3. GitHub repository 연결하거나 "Import" 선택
4. 이 디렉토리(`support-site`) 선택
5. Project Name: `rezom-support`
6. Deploy 클릭

### Option 3: GitHub Pages로 배포

1. GitHub repository의 Settings로 이동
2. Pages 섹션 선택
3. Source를 `support-site` 디렉토리로 설정
4. Save

## 배포 후 확인사항

1. URL이 공개적으로 접근 가능한지 확인
2. 모든 FAQ 내용이 정확히 표시되는지 확인
3. 이메일 링크가 작동하는지 확인
4. 이용약관/개인정보처리방침 링크가 작동하는지 확인

## App Store Connect에서 설정

배포 완료 후:
1. App Store Connect 로그인
2. 앱 선택 → App Information
3. Support URL을 새로운 URL로 업데이트
4. 저장
