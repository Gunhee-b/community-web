/**
 * Validate username
 * - 2-20자
 * - 한글, 영문, 숫자 가능
 */
export const validateUsername = (username) => {
  if (!username || username.length < 2 || username.length > 20) {
    return '닉네임은 2-20자 사이여야 합니다'
  }
  const regex = /^[가-힣a-zA-Z0-9]+$/
  if (!regex.test(username)) {
    return '닉네임은 한글, 영문, 숫자만 사용 가능합니다'
  }
  return null
}

/**
 * Validate password
 * - 8-20자
 * - 영문, 숫자, 특수문자 중 2가지 이상 조합
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8 || password.length > 20) {
    return '비밀번호는 8-20자 사이여야 합니다'
  }

  let count = 0
  if (/[a-zA-Z]/.test(password)) count++
  if (/[0-9]/.test(password)) count++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) count++

  if (count < 2) {
    return '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합이어야 합니다'
  }

  return null
}

/**
 * Validate invitation code
 * - 6자리 대문자 영문 + 숫자
 */
export const validateInvitationCode = (code) => {
  if (!code || code.length !== 6) {
    return '초대 코드는 6자리여야 합니다'
  }
  const regex = /^[A-Z0-9]{6}$/
  if (!regex.test(code)) {
    return '초대 코드 형식이 올바르지 않습니다'
  }
  return null
}

/**
 * Validate comment
 * - 최대 200자
 */
export const validateComment = (comment) => {
  if (!comment || comment.trim().length === 0) {
    return '댓글을 입력해주세요'
  }
  if (comment.length > 200) {
    return '댓글은 최대 200자까지 입력 가능합니다'
  }
  return null
}

/**
 * Validate post title
 */
export const validatePostTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return '제목을 입력해주세요'
  }
  if (title.length > 100) {
    return '제목은 최대 100자까지 입력 가능합니다'
  }
  return null
}

/**
 * Validate post content
 */
export const validatePostContent = (content) => {
  if (!content || content.trim().length === 0) {
    return '내용을 입력해주세요'
  }
  if (content.length > 2000) {
    return '내용은 최대 2000자까지 입력 가능합니다'
  }
  return null
}
