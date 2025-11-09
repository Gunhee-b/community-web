# 새 모임 알림 시스템 가이드

## 개요

새로운 모임이 생성되면 모든 활성 사용자에게 자동으로 알림이 전송되는 시스템입니다.

## 작동 방식

### 1. 자동 알림 발송
- 모임이 생성되면 **데이터베이스 트리거**가 자동으로 실행됩니다
- 모임을 만든 사용자를 제외한 **모든 활성 사용자**에게 알림이 생성됩니다
- 알림은 **실시간**으로 전송되며, 로그인한 사용자는 즉시 알림 벨에 표시됩니다

### 2. 알림 내용
알림에는 다음 정보가 포함됩니다:
- 모임 유형 (정기 모임 / 즉흥 취미 모임 / 즉흥 토론 모임)
- 모임 목적 (☕ 커피 / 🍺 술)
- 모임 장소 (📍)
- 모임장 이름 (👤)

**알림 예시:**
```
🎉 새로운 모임이 오픈되었습니다!
즉흥 취미 모임 | ☕ 커피 | 📍 강남역 스타벅스 | 👤 홍길동
```

### 3. 알림 확인 및 이동
- 알림 벨 아이콘을 클릭하여 알림 목록 확인
- 알림을 클릭하면 해당 모임 상세 페이지로 이동
- 알림 삭제 가능 (개별 삭제 또는 전체 삭제)

## 데이터베이스 마이그레이션 적용

### 방법 1: Supabase Dashboard 사용 (권장)

1. Supabase 프로젝트 대시보드에 로그인
2. 왼쪽 메뉴에서 **SQL Editor** 선택
3. **New query** 클릭
4. `supabase/migrations/20250206_add_notification_system.sql` 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭하여 실행

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI가 설치되어 있어야 합니다
npx supabase db push
```

## 마이그레이션이 추가하는 내용

### 1. notifications 테이블 생성
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    meeting_id UUID REFERENCES offline_meetings(id),
    related_id TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP
);
```

### 2. 자동 알림 트리거
- `notify_new_meeting()` 함수: 새 모임 생성 시 자동으로 알림 생성
- `trigger_notify_new_meeting` 트리거: INSERT 이벤트에 반응

### 3. RLS 정책
- 사용자는 자신의 알림만 조회/수정/삭제 가능
- 시스템은 모든 사용자에게 알림 생성 가능

### 4. 유틸리티 함수
- `get_unread_notification_count(user_id)`: 읽지 않은 알림 개수 조회
- `mark_all_notifications_as_read(user_id)`: 모든 알림을 읽음으로 표시

### 5. Realtime 활성화
- 알림 테이블에 대한 실시간 구독 활성화
- 새 알림이 생성되면 즉시 클라이언트에 전송

## 코드 변경사항

### 1. notificationStore.js
- **데이터베이스 기반 알림 시스템 추가**
- 로컬 알림(채팅 등)과 DB 알림(모임 등)을 모두 지원
- 실시간 구독 기능 추가

주요 함수:
- `loadDbNotifications(userId)`: DB에서 알림 로드
- `subscribeToNotifications(userId)`: 실시간 알림 구독
- `getAllNotifications()`: 로컬 + DB 알림 통합 조회

### 2. MainLayout.jsx
- 로그인 시 자동으로 알림 시스템 초기화
- 실시간 알림 구독 설정

### 3. NotificationBell.jsx
- DB 알림과 로컬 알림 통합 표시
- 알림 클릭 시 모임 상세 페이지로 이동
- 알림 삭제 시 DB에서도 삭제

## 테스트 방법

### 1. 기본 테스트
1. **사용자 A**: 모임 생성
2. **사용자 B**: 로그인 상태에서 알림 벨 확인
3. 새 모임 알림이 즉시 표시되는지 확인

### 2. 실시간 테스트
1. **사용자 B**: 로그인 상태로 대기
2. **사용자 A**: 새 모임 생성
3. **사용자 B**: 알림 벨에 빨간 배지가 즉시 나타나는지 확인

### 3. 알림 클릭 테스트
1. 알림 벨 클릭하여 알림 목록 열기
2. 모임 알림 클릭
3. 해당 모임 상세 페이지로 이동하는지 확인

### 4. 다중 사용자 테스트
1. 3명 이상의 사용자 계정 생성
2. **사용자 A**: 모임 생성
3. **사용자 B, C**: 알림 수신 확인
4. **사용자 A**: 알림 받지 않음 (자신이 만든 모임)

## 알림 유형

현재 지원하는 알림 유형:
- `meeting`: 새 모임 생성 (🎉)
- `chat`: 채팅 메시지 (💬)
- `system`: 시스템 알림 (🔔)

### 향후 추가 가능한 알림
- `vote`: 투표 관련 알림
- `question`: 오늘의 질문 알림
- `comment`: 댓글 알림
- `meeting_update`: 모임 정보 변경 알림
- `meeting_confirmed`: 모임 확정 알림

## 주의사항

### 1. 데이터베이스 마이그레이션 필수
- 마이그레이션을 적용하지 않으면 알림 기능이 작동하지 않습니다
- 에러가 발생하면 Supabase 대시보드의 로그를 확인하세요

### 2. Realtime 활성화 확인
- Supabase 프로젝트에서 Realtime이 활성화되어 있어야 합니다
- `notifications` 테이블이 Realtime publication에 추가되어야 합니다

### 3. 성능 고려사항
- 사용자가 많아지면 알림 생성 시간이 증가할 수 있습니다
- 필요시 백그라운드 작업으로 변경 고려
- 오래된 알림 자동 삭제 정책 추가 권장

### 4. 모바일 앱
- 현재는 웹 기반 알림입니다
- 모바일 푸시 알림은 별도 구현 필요 (APP_LAUNCH_TODO.md 참조)

## 문제 해결

### 알림이 생성되지 않음
1. 마이그레이션이 올바르게 적용되었는지 확인
2. 트리거가 활성화되어 있는지 확인:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_notify_new_meeting';
   ```
3. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

### 실시간 알림이 작동하지 않음
1. Realtime이 활성화되어 있는지 확인
2. 브라우저 콘솔에서 WebSocket 연결 상태 확인
3. 페이지 새로고침 후 다시 시도

### 알림이 중복 생성됨
- 현재는 모임 생성마다 알림이 생성됩니다
- 동일 모임에 대한 중복 알림 방지 로직은 추가되지 않았습니다

## 다음 단계

### 1. 모바일 푸시 알림 (Phase 5)
- Firebase Cloud Messaging 통합
- 앱이 백그라운드일 때도 알림 수신
- 알림 클릭 시 특정 화면으로 딥링크

### 2. 알림 설정
- 사용자가 원하는 알림 유형 선택
- 알림 시간대 설정
- 알림 음소거 기능

### 3. 알림 요약
- 일일/주간 알림 요약 이메일
- 중요 알림 강조 표시

### 4. 알림 보관함
- 읽은 알림도 보관
- 알림 검색 기능
- 알림 필터링

---

**작성일**: 2025년 2월 6일
**버전**: v2.7.0 (Notification System)

**중요**: 데이터베이스 마이그레이션을 먼저 적용한 후 기능을 테스트하세요!
