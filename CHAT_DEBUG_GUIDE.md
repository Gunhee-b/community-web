# 채팅 기능 디버그 가이드

채팅방이 보이지 않는 문제를 해결하기 위한 단계별 가이드입니다.

## 1단계: 브라우저 콘솔 확인

1. 브라우저에서 **F12** 키를 눌러 개발자 도구를 엽니다
2. **Console** 탭으로 이동합니다
3. 모임 상세 페이지로 이동합니다 (`/meetings/:id`)
4. 콘솔에서 다음 로그를 확인하세요:

```
Current user ID: [UUID]
Participants: [배열]
Is participant: true/false
```

### 예상되는 상황들:

#### 상황 A: "Is participant: false"로 표시되는 경우
→ 모임에 참가하지 않았거나, 참가가 제대로 되지 않았습니다.

**해결방법:**
1. "모임 참가하기" 버튼을 클릭합니다
2. 콘솔에서 에러가 있는지 확인합니다
3. 페이지를 새로고침합니다

#### 상황 B: "Is participant: true"이지만 채팅방이 안 보이는 경우
→ UI 렌더링 문제입니다.

**해결방법:**
1. 브라우저 캐시를 지웁니다
2. 페이지를 새로고침합니다

#### 상황 C: "Is participant: true"이고 채팅방은 보이지만 메시지를 보낼 수 없는 경우
→ RLS 정책 문제입니다.

**해결방법:** 아래 2단계로 진행하세요.

## 2단계: SQL 정책 확인

Supabase SQL Editor에서 `debug_chat.sql`을 실행하여 문제를 진단합니다.

### 실행할 쿼리:

```sql
-- 1. 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'meeting_chats';
```

**예상 결과:**
- `Anyone can read chats` (SELECT)
- `Anyone can send messages` (INSERT)

두 정책이 모두 있어야 합니다. 없으면 `fix_chat_policies.sql`을 다시 실행하세요.

### 특정 모임 확인:

```sql
-- 모임 목록 확인
SELECT id, location, status, host_id
FROM offline_meetings
ORDER BY created_at DESC
LIMIT 5;

-- 모임 ID를 복사한 후, 참가자 확인 (YOUR_MEETING_ID를 실제 ID로 교체)
SELECT mp.*, u.username
FROM meeting_participants mp
JOIN users u ON u.id = mp.user_id
WHERE mp.meeting_id = 'YOUR_MEETING_ID'
AND mp.cancelled_at IS NULL;
```

여기서 본인의 username이 보여야 합니다.

## 3단계: 수동 테스트

SQL Editor에서 직접 메시지를 삽입해봅니다:

```sql
-- YOUR_MEETING_ID와 YOUR_USER_ID를 실제 값으로 교체
INSERT INTO meeting_chats (meeting_id, user_id, message, anonymous_name)
VALUES (
    'YOUR_MEETING_ID',
    'YOUR_USER_ID',
    '테스트 메시지',
    '참가자1'
);
```

**에러가 발생하면:**
- RLS 정책이 제대로 적용되지 않은 것입니다
- `fix_chat_policies.sql`을 다시 실행하세요

**성공하면:**
- 브라우저에서 채팅방을 다시 확인하세요
- 테스트 메시지가 보여야 합니다

## 4단계: 완전 초기화 (최후의 수단)

모든 방법이 실패하면, RLS 정책을 완전히 재설정합니다:

```sql
-- meeting_chats의 모든 정책 삭제
DROP POLICY IF EXISTS "Anyone can read chats" ON meeting_chats;
DROP POLICY IF EXISTS "Anyone can send messages" ON meeting_chats;
DROP POLICY IF EXISTS "Participants can read meeting chats" ON meeting_chats;
DROP POLICY IF EXISTS "Participants can send messages" ON meeting_chats;

-- 새 정책 생성
CREATE POLICY "Anyone can read chats" ON meeting_chats
    FOR SELECT USING (true);

CREATE POLICY "Anyone can send messages" ON meeting_chats
    FOR INSERT WITH CHECK (true);
```

## 5단계: 브라우저 테스트

1. **브라우저 캐시를 완전히 지웁니다**:
   - Chrome: Cmd+Shift+Delete (Mac) 또는 Ctrl+Shift+Delete (Windows)
   - "캐시된 이미지 및 파일" 선택
   - 삭제

2. **localStorage 초기화**:
   ```javascript
   localStorage.clear()
   ```

3. **앱 재시작**:
   ```bash
   npm run dev
   ```

4. **로그인 후 테스트**:
   - 새 모임 생성
   - 모임 참가
   - 메시지 전송

## 체크리스트

다음 항목을 순서대로 확인하세요:

- [ ] `fix_chat_policies.sql` 실행했나요?
- [ ] 브라우저 콘솔에서 "Is participant: true"로 나오나요?
- [ ] SQL에서 정책이 올바르게 설정되었나요?
- [ ] `meeting_participants` 테이블에 본인이 등록되어 있나요?
- [ ] 브라우저 캐시를 지웠나요?
- [ ] localStorage를 초기화했나요?

## 추가 디버그 정보

변경된 `MeetingDetailPage.jsx`에는 다음과 같은 로그가 추가되었습니다:

```javascript
console.log('Current user ID:', user.id)
console.log('Participants:', participantsData)
console.log('Is participant:', isUserParticipant)
console.log('Fetching chats...')
console.log('Chats loaded:', data)
console.log('Sending message:', {...})
console.log('Message sent successfully:', data)
```

이 로그들을 통해 각 단계에서 무엇이 잘못되었는지 확인할 수 있습니다.

## 여전히 작동하지 않는 경우

콘솔 로그 전체를 복사해서 공유해주세요. 다음 정보가 필요합니다:

1. 브라우저 콘솔의 모든 로그
2. `debug_chat.sql` 실행 결과
3. 어떤 단계에서 막혔는지

이 정보로 정확한 문제를 파악할 수 있습니다.
