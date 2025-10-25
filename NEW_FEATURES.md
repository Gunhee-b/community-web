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

## 2. 웹 기반 채팅 알림 시스템 🔔 (v2.3.1)

### 기능 설명
- 다른 사용자가 채팅 메시지를 보내면 웹 페이지 내부의 알림 벨에 알림이 표시됩니다
- 브라우저 알림 권한이 필요 없습니다
- 본인이 보낸 메시지는 알림이 가지 않습니다
- **실제 사용자 닉네임**으로 알림 표시 (익명 이름 대신)

### 주요 개선사항 (v2.3.0 ~ v2.3.1)

#### ✅ 알림 클릭 시 자동 삭제 (v2.3.0)
- 이전: `markAsRead`로 읽음 표시만 하고 localStorage에 계속 저장
- 변경: `deleteNotification`으로 완전히 삭제하여 깔끔한 관리

#### ✅ 중복 체크 로직 개선 (v2.3.0)
- 이전: 전체 알림 배열에서 `messageId` 확인 (읽은 알림 포함)
- 변경: **읽지 않은 알림만** 확인하도록 수정
- 효과: localStorage 용량 최적화

#### ✅ Stale Closure 문제 해결 (v2.3.1)
- **문제**: 알림을 삭제해도 5초 후 다시 나타남
- **원인**: setInterval의 stale closure 문제로 폴링이 오래된 chats 값을 참조
- **해결**: `useRef`를 사용하여 항상 최신 chats 값을 참조
- **결과**: 알림 삭제 후 다시 나타나는 문제 완전히 해결

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

## 3. 모임 이미지 업로드 및 크롭 기능 🖼️

### 기능 설명
- 모임 생성 및 수정 시 대표 이미지를 업로드할 수 있습니다
- 드래그 기반의 직관적인 이미지 크롭 에디터 제공
- 모바일과 데스크톱 모두 지원
- 인물 사진 최적화를 위한 가이드 제공

### 주요 기능

#### 1. 이미지 업로드
- 모임 생성 페이지에서 이미지 선택
- 최대 파일 크기: 5MB
- 지원 형식: JPG, PNG, GIF 등 모든 이미지 형식
- 업로드 전 미리보기 제공

#### 2. 이미지 크롭 에디터
- **위치 조정**: 한 손가락 드래그 (모바일) / 일반 드래그 (PC)
- **확대/축소**:
  - 모바일: 두 손가락 핀치 제스처
  - PC: Shift + 대각선 드래그 또는 마우스 휠
- **고정 비율**: 4:3 비율로 자동 크롭
- **실시간 줌 레벨 표시**: 1.0x ~ 3.0x

#### 3. 자동 최적화
- 출력 크기: 1200px (자동 설정)
- 이미지 품질: 85% (자동 설정)
- JPEG 형식으로 변환하여 저장
- 비율 유지하며 리사이즈

### 사용 방법

#### 모임 생성 시
1. **모임 만들기** 페이지에서 "모임 사진" 섹션 찾기
2. 이미지 업로드 영역 클릭하여 파일 선택
3. 이미지 미리보기 확인
4. **🔧 이미지 크기 조정** 버튼 클릭 (선택사항)
5. 크롭 에디터에서 이미지 조정:
   - 드래그로 위치 이동
   - 핀치/휠로 확대/축소
6. **적용** 버튼 클릭
7. 모임 생성 완료

#### 모임 수정 시
1. 모임 상세 페이지에서 **모임 수정** 버튼 클릭
2. 수정 모달에서 이미지 섹션 찾기
3. 새 이미지 업로드 또는 기존 이미지 제거
4. 이미지 크기 조정 (선택사항)
5. **수정** 버튼 클릭

### 기술 구현

#### 1. 이미지 크롭 컴포넌트
```javascript
// src/components/meetings/ImageAdjustModal.jsx
import Cropper from 'react-easy-crop'

function ImageAdjustModal({ isOpen, onClose, imagePreview, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // 터치 제스처 지원
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      setTouchDistance(distance)
      setStartZoom(zoom)
    }
  }, [zoom])

  return (
    <div className="modal">
      <Cropper
        image={imagePreview}
        crop={crop}
        zoom={zoom}
        aspect={4 / 3}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
    </div>
  )
}
```

#### 2. 이미지 크롭 유틸리티
```javascript
// src/utils/imageCrop.js
export const getCroppedImg = (imageSrc, pixelCrop, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc

    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // 비율 유지하며 크기 계산
      let outputWidth = pixelCrop.width
      let outputHeight = pixelCrop.height

      if (outputWidth > maxWidth || outputHeight > maxHeight) {
        const scale = Math.min(maxWidth / outputWidth, maxHeight / outputHeight)
        outputWidth = Math.floor(outputWidth * scale)
        outputHeight = Math.floor(outputHeight * scale)
      }

      canvas.width = outputWidth
      canvas.height = outputHeight

      // 크롭된 이미지 그리기
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        outputWidth, outputHeight
      )

      // Blob으로 변환
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
  })
}
```

#### 3. Supabase Storage 업로드
```javascript
// 크롭된 이미지 업로드
if (croppedAreaPixels) {
  const croppedBlob = await getCroppedImg(
    imagePreview,
    croppedAreaPixels,
    1200,
    1200,
    0.85
  )

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`

  const { error } = await supabase.storage
    .from('meeting-images')
    .upload(fileName, croppedBlob, {
      cacheControl: '3600',
      contentType: 'image/jpeg'
    })

  const { data: { publicUrl } } = supabase.storage
    .from('meeting-images')
    .getPublicUrl(fileName)
}
```

#### 4. Storage 버킷 설정
```sql
-- meeting-images 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('meeting-images', 'meeting-images', true, 5242880, ARRAY['image/*']);

-- Public 정책 (커스텀 인증 시스템용)
CREATE POLICY "Anyone can upload meeting images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'meeting-images');

CREATE POLICY "Public read access for meeting images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-images');
```

### 이미지 표시

#### 모임 리스트
```javascript
// src/pages/meetings/MeetingsPage.jsx
{meeting.image_url && (
  <img
    src={meeting.image_url}
    alt={meeting.location}
    className="w-full h-48 object-cover rounded-lg mb-4"
  />
)}
```

#### 모임 상세 페이지
```javascript
// src/pages/meetings/MeetingDetailPage.jsx
{meeting.image_url && (
  <img
    src={meeting.image_url}
    alt={meeting.location}
    className="w-full h-64 object-cover rounded-lg mb-4"
  />
)}
```

### 크롭 에디터 조작법

#### 모바일
- **한 손가락 드래그**: 이미지 위치 이동
- **두 손가락 핀치**: 확대/축소
- **더블 탭**: 확대 (기본 기능)

#### 데스크톱
- **일반 드래그**: 이미지 위치 이동
- **Shift + 대각선 드래그**: 확대/축소
- **마우스 휠**: 확대/축소
- **우클릭 + 드래그**: 확대/축소

### 최적화 사항

1. **파일 크기 제한**: 5MB 이하만 업로드 가능
2. **자동 압축**: 85% 품질로 JPEG 변환
3. **비율 고정**: 4:3 비율로 일관성 유지
4. **리사이즈**: 최대 1200px로 자동 조정
5. **캐시 제어**: 1시간 캐시 설정

### 에러 처리

```javascript
// 파일 타입 검증
if (!file.type.startsWith('image/')) {
  setError('이미지 파일만 업로드할 수 있습니다')
  return
}

// 파일 크기 검증
if (file.size > 5 * 1024 * 1024) {
  setError('이미지 크기는 5MB 이하여야 합니다')
  return
}

// 업로드 에러 처리
if (uploadError) {
  throw new Error('이미지 업로드 중 오류가 발생했습니다')
}
```

### 데이터베이스 마이그레이션

```sql
-- offline_meetings 테이블에 image_url 컬럼 추가
ALTER TABLE offline_meetings
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### 의존성 패키지

```json
{
  "dependencies": {
    "react-easy-crop": "^5.0.0"
  }
}
```

### Storage 정책 참고

커스텀 인증 시스템을 사용하므로 `authenticated` 대신 `public` 역할을 사용합니다:

```sql
-- ❌ 작동 안 함 (Supabase Auth 전용)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'meeting-images');

-- ✅ 작동함 (커스텀 인증)
CREATE POLICY "Anyone can upload meeting images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'meeting-images');
```

### 주의사항

1. **크롭 없이 업로드**: 크기 조정 버튼을 누르지 않아도 업로드 가능 (자동 리사이즈)
2. **이미지 삭제**: 수정 시 이미지를 제거하면 Storage에서도 삭제됨
3. **모바일 성능**: 큰 이미지는 모바일에서 느릴 수 있음 (5MB 제한 권장)
4. **브라우저 지원**: 최신 브라우저에서만 테스트됨

### 파일 구조

```
src/
├── components/
│   └── meetings/
│       └── ImageAdjustModal.jsx       # 이미지 크롭 모달
├── pages/
│   └── meetings/
│       ├── CreateMeetingPage.jsx      # 모임 생성 (이미지 업로드)
│       ├── MeetingDetailPage.jsx      # 모임 상세 (이미지 표시/수정)
│       └── MeetingsPage.jsx           # 모임 리스트 (이미지 표시)
├── utils/
│   └── imageCrop.js                   # 이미지 크롭 유틸리티
└── supabase/
    └── migrations/
        ├── 20250125_add_meeting_image_url.sql
        ├── 20250125_create_meeting_images_bucket.sql
        └── 20250125_fix_storage_rls_policies.sql
```

### 테스트 체크리스트

- [ ] 이미지 업로드 (모임 생성)
- [ ] 이미지 미리보기 표시
- [ ] 크롭 에디터 열기
- [ ] 드래그로 위치 이동
- [ ] 핀치/휠로 확대/축소
- [ ] 크롭 적용 및 저장
- [ ] 모임 리스트에서 이미지 표시
- [ ] 모임 상세에서 이미지 표시
- [ ] 이미지 수정 (모임 수정)
- [ ] 이미지 제거 (모임 수정)
- [ ] 크롭 없이 직접 업로드

---

## 4. 채팅 기능 개선 💬 (v2.4.0)

### 기능 설명
- 채팅에서 **실제 사용자 닉네임** 표시 (익명 이름 대신)
- **메시지 전송 시간** 표시 ("3분 전", "1시간 전" 등)
- 채팅방 제목 변경: "익명 채팅방" → "모임 채팅방"

### 주요 변경사항

#### ✅ 실제 닉네임 표시
```javascript
// 이전: 참가자1, 참가자2
{chat.anonymous_name}

// 변경 후: 홍길동, 김철수
{chat.user?.username || chat.anonymous_name}
```

**채팅 조회 시 users 테이블과 join:**
```javascript
const { data } = await supabase
  .from('meeting_chats')
  .select('*, user:users!user_id(username)')
  .eq('meeting_id', id)
  .order('created_at', { ascending: true })
```

#### ✅ 메시지 전송 시간 표시
```javascript
<div className="text-xs opacity-60">
  {formatDistanceToNow(new Date(chat.created_at), {
    addSuffix: true,
    locale: ko,
  })}
</div>
```

**표시 형식:**
- "방금 전"
- "3분 전"
- "1시간 전"
- "2일 전"

#### ✅ Realtime 메시지에도 username 표시
- Realtime으로 새 메시지 도착 시 sender의 username 조회
- 알림에도 실제 닉네임 표시

```javascript
// Realtime 콜백에서 username 조회
const { data: senderData } = await supabase
  .from('users')
  .select('username')
  .eq('id', payload.new.user_id)
  .single()

const senderName = senderData?.username || payload.new.anonymous_name
```

### UI 변화

**이전:**
```
참가자2
안녕하세요!
```

**변경 후:**
```
홍길동
안녕하세요!
3분 전
```

**주최자:**
```
👑 김철수 (주최자)
모임 시간 변경되었습니다
5분 전
```

### 기술 구현

#### 1. date-fns 라이브러리 사용
```javascript
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
```

#### 2. 채팅 UI 구조
```javascript
<div className="inline-block max-w-xs px-4 py-2 rounded-lg bg-blue-500 text-white">
  {/* 닉네임 */}
  <div className="text-xs mb-1 opacity-75 font-medium">
    {isHost && '👑 '}
    {chat.user?.username || chat.anonymous_name}
    {isHost && ' (주최자)'}
  </div>

  {/* 메시지 */}
  <div className="mb-1">{chat.message}</div>

  {/* 시간 */}
  <div className="text-xs opacity-60">
    {formatDistanceToNow(new Date(chat.created_at), {
      addSuffix: true,
      locale: ko,
    })}
  </div>
</div>
```

### 장점

1. ✅ **사용자 식별 용이**: 실제 닉네임으로 누가 말하는지 명확히 파악
2. ✅ **시간 정보**: 언제 보낸 메시지인지 바로 확인 가능
3. ✅ **사용자 경험 향상**: 익명성보다 실명제가 더 적합한 모임 특성 반영
4. ✅ **알림 개선**: 알림에도 실제 닉네임 표시로 누가 보냈는지 파악 쉬움

### 주의사항

- 기존 `anonymous_name` 필드는 fallback으로 유지
- `user` 테이블과 join하므로 약간의 쿼리 성능 영향
- Realtime 메시지는 추가 쿼리로 username 조회

---

## 다음 개선 가능 사항

1. **이미지 필터 효과** (밝기, 대비, 채도 조정)
2. **다중 이미지 업로드** (갤러리 형식)
3. **이미지 회전 기능**
4. **참가자 강제 퇴장** (관리자/호스트)
5. **메시지 삭제** (본인 메시지만)
6. **읽음 표시** (누가 메시지를 읽었는지)
7. **타이핑 표시** (누가 입력 중인지)
8. **이모지 반응**
9. **메시지 검색**
