# 데이터베이스 마이그레이션 가이드

## 문제 상황
서버 배포 후 다음과 같은 에러가 발생하는 경우:
```
POST https://[your-project].supabase.co/rest/v1/rpc/get_user_by_id 404 (Not Found)
Error: Could not find the function public.get_user_by_id(p_user_id) in the schema cache
```

## 원인
Supabase 데이터베이스에 필요한 함수나 테이블 변경사항이 아직 적용되지 않았습니다.

## 해결 방법

### 방법 1: Supabase 대시보드에서 직접 실행 (권장)

1. **Supabase 대시보드 접속**
   - https://app.supabase.com 에 로그인
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "+ New query" 클릭

3. **마이그레이션 파일 실행**

   다음 순서대로 각 마이그레이션 파일의 내용을 복사하여 실행:

   #### 필수 마이그레이션 (순서대로 실행):

   1. `20250116_get_user_by_id_function.sql` - 사용자 조회 함수
   2. `20250117_add_end_datetime_to_meetings.sql` - 모임 종료시간 필드 추가

   각 파일을 실행하는 방법:
   - 로컬 프로젝트의 `supabase/migrations/` 폴더에서 파일 열기
   - SQL 내용 복사
   - Supabase SQL Editor에 붙여넣기
   - "RUN" 버튼 클릭
   - 성공 메시지 확인

### 방법 2: Supabase CLI 사용 (로컬 개발자용)

```bash
# Supabase CLI가 설치되어 있다면
supabase login
supabase link --project-ref [your-project-ref]
supabase db push
```

## 각 마이그레이션 파일 설명

### 1. `20250116_get_user_by_id_function.sql`
- **목적**: 사용자 정보를 ID로 조회하는 함수 생성
- **기능**: 페이지 새로고침 시 로그인 상태 유지 및 사용자 정보 검증
- **필수 여부**: ⭐ 필수 (없으면 404 에러 발생)

### 2. `20250117_add_end_datetime_to_meetings.sql`
- **목적**: 모임 테이블에 종료 시간 필드 추가
- **변경사항**:
  - `meeting_datetime` → `start_datetime`로 이름 변경
  - `end_datetime` 필드 추가
  - 기존 모임에 자동으로 종료 시간 설정 (시작시간 + 2시간)
- **필수 여부**: ⭐ 필수 (새 기능에 필요)

## 마이그레이션 실행 확인

마이그레이션이 성공적으로 실행되었는지 확인하려면:

### 1. 함수 확인
SQL Editor에서 실행:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_by_id';
```
결과가 있으면 성공 ✅

### 2. 테이블 구조 확인
SQL Editor에서 실행:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'offline_meetings'
AND column_name IN ('start_datetime', 'end_datetime');
```
두 컬럼이 모두 있으면 성공 ✅

## 문제 해결

### 에러: "relation does not exist"
- **원인**: 테이블이 생성되지 않음
- **해결**: `20241015000001_initial_schema.sql` 먼저 실행

### 에러: "function already exists"
- **원인**: 이미 실행된 마이그레이션
- **해결**: 문제 없음, 다음 마이그레이션으로 진행

### 에러: "column already exists"
- **원인**: 이미 실행된 마이그레이션
- **해결**: 해당 마이그레이션 건너뛰기

## 배포 후 체크리스트

- [ ] 모든 마이그레이션 파일 실행 완료
- [ ] `get_user_by_id` 함수 생성 확인
- [ ] `offline_meetings` 테이블에 `start_datetime`, `end_datetime` 존재 확인
- [ ] 브라우저에서 로그인 테스트
- [ ] 새로고침 후 로그인 상태 유지 확인
- [ ] 모임 생성/조회 기능 테스트

## 추가 도움

문제가 지속되는 경우:
1. 브라우저 콘솔에서 정확한 에러 메시지 확인
2. Supabase 대시보드 > Logs 확인
3. 모든 마이그레이션 파일이 실행되었는지 재확인

---

**마지막 업데이트**: 2025년 1월 17일
