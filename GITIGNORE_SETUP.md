# .gitignore 설정 가이드

## ✅ 완료된 작업

### 1. .gitignore 파일 업데이트
- ✅ 루트 `.gitignore` 생성
- ✅ `web/.gitignore` 업데이트
- ✅ `app/.gitignore` 업데이트

### 2. Git 캐시에서 민감한 파일 제거
- ✅ `app/.env` 파일 제거 (Git 추적 해제)
- ✅ 로컬 파일은 유지됨

## 📁 보호되는 파일들

### 환경 변수
- `.env`
- `.env.*` (모든 .env 변형)
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- **예외**: `.env.example`은 Git에 포함 (템플릿용)

### 민감한 인증 정보
- `*.pem` (SSL 인증서)
- `*.key` (키 파일)
- `*.cert` (인증서)
- `credentials.json`
- `secrets.json`
- `*.jks` (Java keystore)
- `*.p8`, `*.p12` (Apple 인증서)
- `*.mobileprovision`

### 빌드 및 의존성
- `node_modules/`
- `dist/`
- `build/`
- `.expo/`
- `web-build/`

### OS 및 에디터 파일
- `.DS_Store` (macOS)
- `Thumbs.db` (Windows)
- `.vscode/` (VS Code)
- `.idea/` (IntelliJ)
- `*.swp`, `*.swo` (Vim)

### 로그 및 임시 파일
- `*.log`
- `*.tmp`
- `*.temp`
- `*.bak`
- `*.backup`

## 🚀 다음 단계

### 1. 변경사항 커밋

```bash
# 현재 상태 확인
git status

# 변경사항 확인
# D  app/.env              (Git에서 제거됨, 로컬에는 유지)
# M  app/.gitignore        (.env 보호 추가)
# M  web/.gitignore        (정리 및 강화)
# ?? .gitignore            (루트 레벨 추가)

# 모든 변경사항 스테이징
git add .gitignore
git add app/.gitignore
git add web/.gitignore
git add app/.env  # 삭제된 상태를 스테이징

# 커밋
git commit -m "chore: .gitignore 설정 강화 및 민감한 파일 제거

- 루트, web, app 디렉토리 .gitignore 업데이트
- 모든 .env 파일 Git 추적에서 제외
- app/.env를 Git 캐시에서 제거 (로컬 파일 유지)
- 민감한 인증 정보 파일 보호 강화
- .env.example은 템플릿으로 유지"
```

### 2. 원격 저장소에 푸시

```bash
git push origin main
```

### 3. GitHub에서 확인

푸시 후 GitHub 저장소에서 확인:
1. `app/.env` 파일이 사라졌는지 확인
2. `.env.example` 파일은 남아있는지 확인
3. `.gitignore` 파일들이 업데이트되었는지 확인

## ⚠️ 중요 사항

### 이미 푸시된 민감한 정보
**app/.env가 이미 GitHub에 푸시되어 있었다면:**

1. **Git 히스토리에서 완전히 제거 필요**
   ```bash
   # BFG Repo-Cleaner 사용 (권장)
   # https://rtyley.github.io/bfg-repo-cleaner/

   # 또는 git filter-branch 사용
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch app/.env" \
     --prune-empty --tag-name-filter cat -- --all

   # 강제 푸시 (주의!)
   git push origin --force --all
   ```

2. **환경 변수 값 변경**
   - Supabase 키 재발급
   - Kakao API 키 재발급
   - 모든 민감한 정보 새로 생성

3. **GitHub Secret Scanning 확인**
   - GitHub Settings > Security > Secret scanning alerts

## 📝 .env 파일 관리 방법

### 개발 환경
```bash
# web/.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_KAKAO_CLIENT_ID=your-kakao-id
VITE_KAKAO_CLIENT_SECRET=your-kakao-secret

# app/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 프로덕션 환경 (Vercel, EAS)
- **Vercel**: Dashboard > Settings > Environment Variables
- **EAS**: `eas secret:create` 명령 사용
- **절대 .env 파일을 배포하지 말 것**

## 🔍 확인 명령어

### Git에 추적되는 민감한 파일 확인
```bash
# .env 파일 검색
git ls-files | grep -E "\.env$"

# 모든 민감한 파일 검색
git ls-files | grep -E "\.(env|pem|key|cert)$|credentials\.json|secrets\.json"
```

### 현재 무시되는 파일 확인
```bash
# 무시되는 파일 보기
git status --ignored

# 특정 파일이 무시되는지 확인
git check-ignore -v .env
git check-ignore -v app/.env
```

## 🛡️ 보안 체크리스트

커밋하기 전 확인:
- [ ] `.env` 파일이 Git에 추가되지 않았는지 확인
- [ ] `git status`에서 민감한 파일이 없는지 확인
- [ ] `.env.example`에 실제 키 값이 없는지 확인
- [ ] `credentials.json`, `secrets.json` 등이 제외되었는지 확인

푸시하기 전 확인:
- [ ] `git log --stat`으로 커밋 내용 확인
- [ ] `git diff origin/main` 으로 차이점 확인
- [ ] GitHub에 민감한 정보가 없을지 재확인

## 🆘 문제 해결

### .env 파일이 계속 추적됨
```bash
# 캐시 완전히 제거
git rm -r --cached .
git add .
git commit -m "chore: .gitignore 재적용"
```

### 실수로 .env를 커밋함
```bash
# 마지막 커밋 취소 (아직 푸시 전)
git reset --soft HEAD~1
git reset HEAD app/.env
git commit -m "chore: .gitignore 업데이트"
```

### .env가 이미 GitHub에 있음
```bash
# 1. 즉시 환경 변수 값 변경 (Supabase, Kakao 키 재발급)
# 2. BFG Repo-Cleaner로 히스토리 정리
# 3. 팀원들에게 공지
```

## 📚 참고 자료

- [GitHub .gitignore 템플릿](https://github.com/github/gitignore)
- [Git에서 민감한 데이터 제거](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

## 🎯 추천 도구

### 사전 예방
- [git-secrets](https://github.com/awslabs/git-secrets) - 커밋 전 민감한 정보 탐지
- [pre-commit](https://pre-commit.com/) - Git hook 자동화

### 사후 조치
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) - Git 히스토리 정리
- [GitGuardian](https://www.gitguardian.com/) - 저장소 스캔

## 팀원 공유사항

팀원들에게 다음을 공유하세요:

1. **로컬 .env 파일 유지**
   - 로컬 `.env` 파일은 삭제되지 않았습니다
   - 계속 사용하면 됩니다

2. **Pull 후 조치**
   ```bash
   git pull origin main
   # .env 파일이 삭제되었다는 메시지가 나와도 정상입니다
   # 로컬 .env 파일은 그대로 유지됩니다
   ```

3. **새로운 환경 변수 추가 시**
   - `.env.example`에만 키 이름 추가
   - 실제 값은 팀 채널에서 공유
   - 절대 `.env` 파일을 Git에 추가하지 말 것
