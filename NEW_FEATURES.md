# 새로운 기능 추가됨

## 1. 관리자 모임 삭제 기능 ✅

### 기능 설명
- 관리자는 어떤 모임이든 삭제할 수 있습니다
- 모임과 관련된 모든 데이터(채팅, 참가자)를 함께 삭제합니다

### 사용 방법
1. **관리자 계정으로 로그인**
2. 모임 상세 페이지로 이동 (`/meetings/:id`)
3. 페이지 하단에 **"🗑️ 관리자: 모임 삭제"** 버튼이 표시됩니다
4. 버튼 클릭 시 확인 대화상자가 나타납니다
5. 확인하면 모임이 즉시 삭제되고 모임 목록으로 이동합니다

### 기술 구현
```javascript
const handleDeleteMeeting = async () => {
  if (!window.confirm('정말로 이 모임을 삭제하시겠습니까?')) {
    return
  }

  // 관련 데이터 모두 삭제
  await supabase.from('meeting_chats').delete().eq('meeting_id', id)
  await supabase.from('meeting_participants').delete().eq('meeting_id', id)
  await supabase.from('offline_meetings').delete().eq('id', id)

  navigate('/meetings')
}
```

### 주의사항
- 삭제는 되돌릴 수 없습니다
- 일반 사용자에게는 버튼이 보이지 않습니다
- 관리자만 `user.role === 'admin'` 체크를 통해 접근 가능

---

## 2. 실시간 채팅 알림 기능 🔔

### 기능 설명
- 다른 사용자가 채팅 메시지를 보내면 브라우저 알림을 받습니다
- 다른 탭이나 창을 사용 중일 때만 알림이 나타납니다
- 본인이 보낸 메시지는 알림이 가지 않습니다

### 작동 조건
1. **브라우저 알림 권한 허용** (자동으로 요청)
2. **다른 탭/창에 있을 때** (같은 페이지를 보고 있으면 알림 없음)
3. **Realtime이 정상 작동 중**

### 알림 내용
```
제목: 새 메시지
내용: 참가자2: 안녕하세요!
```

### 기술 구현

#### 1. 알림 권한 요청
```javascript
useEffect(() => {
  // 페이지 로드 시 알림 권한 요청
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}, [])
```

#### 2. 알림 표시 함수
```javascript
const showNotification = (message, anonymousName) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    // 페이지가 포커스되지 않았을 때만 알림
    if (document.hidden) {
      new Notification('새 메시지', {
        body: `${anonymousName}: ${message}`,
        icon: '/vite.svg',
        tag: 'chat-notification',
      })
    }
  }
}
```

#### 3. Realtime 구독에 알림 추가
```javascript
const channel = supabase
  .channel(`meeting-${id}`)
  .on('postgres_changes', {...}, (payload) => {
    // 다른 사용자의 메시지만 알림
    if (payload.new.user_id !== user.id) {
      showNotification(payload.new.message, payload.new.anonymous_name)
    }

    setChats((prev) => [...prev, payload.new])
  })
  .subscribe()
```

### 브라우저 지원
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari (macOS 12+)
- ❌ iOS Safari (지원 안 함)

### 알림 권한 설정

#### 허용하기
1. 주소창 왼쪽의 자물쇠 아이콘 클릭
2. "알림" 설정을 "허용"으로 변경

#### 차단된 경우
1. 브라우저 설정 → 개인정보 보호 → 사이트 설정
2. 알림 → 사이트 찾기
3. 허용으로 변경

### 테스트 방법

1. **창 2개 열기**:
   - 창 A: 관리자 계정으로 로그인, 모임 참가
   - 창 B: 일반 사용자 계정으로 로그인, 같은 모임 참가

2. **알림 권한 허용**:
   - 두 창 모두에서 알림 권한 허용

3. **테스트**:
   - 창 A에서 메시지 전송
   - 창 B를 다른 탭으로 전환 (또는 최소화)
   - 창 B에서 알림이 나타나는지 확인

4. **확인 사항**:
   - ✅ 다른 창에 있을 때 알림이 오는가?
   - ✅ 같은 창을 보고 있을 때는 알림이 안 오는가?
   - ✅ 본인이 보낸 메시지는 알림이 안 오는가?

---

## 기능 요약

### 관리자 모임 삭제
- **대상**: 관리자만
- **위치**: 모임 상세 페이지 하단
- **동작**: 모임 및 관련 데이터 완전 삭제

### 채팅 알림
- **대상**: 모든 사용자
- **조건**: 다른 탭/창 사용 중
- **내용**: 익명 이름 + 메시지 미리보기

---

## 개발 서버 실행

```bash
npm run dev
```

## 프로덕션 빌드

```bash
npm run build
```

빌드 크기: **392.82 kB** (gzip: 113.39 kB)

---

## 문제 해결

### 알림이 안 나타나는 경우
1. 브라우저 알림 권한 확인
2. 다른 탭으로 전환했는지 확인
3. 본인이 보낸 메시지가 아닌지 확인
4. 콘솔에서 에러 확인

### 모임 삭제가 안 되는 경우
1. 관리자 계정인지 확인: `user.role === 'admin'`
2. 콘솔에서 에러 메시지 확인
3. RLS 정책이 올바른지 확인

### Realtime이 작동하지 않는 경우
1. Supabase Realtime이 활성화되어 있는지 확인
2. 콘솔에서 `Realtime subscription status` 로그 확인
3. 브라우저를 새로고침

---

## 다음 개선 가능 사항

1. **모임 수정 기능** (호스트 전용)
2. **참가자 강제 퇴장** (관리자/호스트)
3. **메시지 삭제** (본인 메시지만)
4. **읽음 표시** (누가 메시지를 읽었는지)
5. **타이핑 표시** (누가 입력 중인지)
6. **이미지/파일 전송**
7. **이모지 반응**
8. **메시지 검색**
