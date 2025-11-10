/**
 * 유효성 검사 유틸리티 함수
 */

/**
 * 이메일 주소 유효성 검사
 *
 * @param email - 검사할 이메일 주소
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidEmail('test@example.com'); // true
 * isValidEmail('invalid-email'); // false
 * ```
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 강도 검사
 * - 최소 8자 이상
 * - 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
 *
 * @param password - 검사할 비밀번호
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidPassword('Password123!'); // true
 * isValidPassword('weak'); // false
 * ```
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(
    Boolean
  ).length;

  return criteriaCount >= 3;
};

/**
 * 비밀번호 강도 평가
 *
 * @param password - 평가할 비밀번호
 * @returns 강도 레벨 ('weak', 'medium', 'strong')
 *
 * @example
 * ```typescript
 * getPasswordStrength('pass'); // 'weak'
 * getPasswordStrength('Password123'); // 'medium'
 * getPasswordStrength('P@ssw0rd!123'); // 'strong'
 * ```
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(
    Boolean
  ).length;

  if (criteriaCount >= 4 && password.length >= 12) return 'strong';
  if (criteriaCount >= 3 && password.length >= 8) return 'medium';
  return 'weak';
};

/**
 * 사용자명 유효성 검사
 * - 2-20자
 * - 영문, 숫자, 언더스코어만 허용
 *
 * @param username - 검사할 사용자명
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidUsername('john_doe123'); // true
 * isValidUsername('a'); // false (너무 짧음)
 * ```
 */
export const isValidUsername = (username: string): boolean => {
  if (username.length < 2 || username.length > 20) return false;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

/**
 * URL 유효성 검사
 *
 * @param url - 검사할 URL
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('not-a-url'); // false
 * ```
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 한국 전화번호 유효성 검사
 *
 * @param phone - 검사할 전화번호
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidPhoneNumber('010-1234-5678'); // true
 * isValidPhoneNumber('01012345678'); // true
 * isValidPhoneNumber('123'); // false
 * ```
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 숫자 범위 검사
 *
 * @param value - 검사할 값
 * @param min - 최소값
 * @param max - 최대값
 * @returns 범위 내 여부
 *
 * @example
 * ```typescript
 * isInRange(5, 1, 10); // true
 * isInRange(15, 1, 10); // false
 * ```
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * 문자열 길이 범위 검사
 *
 * @param value - 검사할 문자열
 * @param min - 최소 길이
 * @param max - 최대 길이
 * @returns 범위 내 여부
 *
 * @example
 * ```typescript
 * isLengthValid('hello', 3, 10); // true
 * isLengthValid('hi', 3, 10); // false
 * ```
 */
export const isLengthValid = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

/**
 * 빈 문자열 또는 공백만 있는지 검사
 *
 * @param value - 검사할 문자열
 * @returns 비어있는지 여부
 *
 * @example
 * ```typescript
 * isEmpty(''); // true
 * isEmpty('   '); // true
 * isEmpty('hello'); // false
 * ```
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * 파일 크기 검사
 *
 * @param fileSize - 파일 크기 (bytes)
 * @param maxSize - 최대 크기 (bytes)
 * @returns 허용 가능 여부
 *
 * @example
 * ```typescript
 * isFileSizeValid(1024 * 1024, 5 * 1024 * 1024); // true (1MB < 5MB)
 * isFileSizeValid(10 * 1024 * 1024, 5 * 1024 * 1024); // false (10MB > 5MB)
 * ```
 */
export const isFileSizeValid = (fileSize: number, maxSize: number): boolean => {
  return fileSize <= maxSize;
};

/**
 * 파일 확장자 검사
 *
 * @param filename - 파일명
 * @param allowedExtensions - 허용된 확장자 배열
 * @returns 허용된 확장자인지 여부
 *
 * @example
 * ```typescript
 * isFileExtensionValid('image.jpg', ['jpg', 'png']); // true
 * isFileExtensionValid('document.pdf', ['jpg', 'png']); // false
 * ```
 */
export const isFileExtensionValid = (filename: string, allowedExtensions: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
};

/**
 * 이미지 파일 검사
 *
 * @param filename - 파일명
 * @returns 이미지 파일 여부
 *
 * @example
 * ```typescript
 * isImageFile('photo.jpg'); // true
 * isImageFile('document.pdf'); // false
 * ```
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  return isFileExtensionValid(filename, imageExtensions);
};

/**
 * 한글 포함 여부 검사
 *
 * @param value - 검사할 문자열
 * @returns 한글 포함 여부
 *
 * @example
 * ```typescript
 * hasKorean('안녕하세요'); // true
 * hasKorean('hello'); // false
 * ```
 */
export const hasKorean = (value: string): boolean => {
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  return koreanRegex.test(value);
};

/**
 * 특수문자 포함 여부 검사
 *
 * @param value - 검사할 문자열
 * @returns 특수문자 포함 여부
 */
export const hasSpecialCharacters = (value: string): boolean => {
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  return specialCharRegex.test(value);
};

/**
 * 숫자만 포함 여부 검사
 *
 * @param value - 검사할 문자열
 * @returns 숫자만 포함 여부
 */
export const isNumericOnly = (value: string): boolean => {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(value);
};

/**
 * 초대 코드 형식 검사
 *
 * @param code - 검사할 초대 코드
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidInviteCode('ABC123'); // true
 * isValidInviteCode('abc'); // false (너무 짧음)
 * ```
 */
export const isValidInviteCode = (code: string): boolean => {
  if (code.length < 6 || code.length > 12) return false;
  const inviteCodeRegex = /^[A-Z0-9]+$/;
  return inviteCodeRegex.test(code);
};

/**
 * 금지어 포함 여부 검사
 *
 * @param value - 검사할 문자열
 * @param bannedWords - 금지어 목록
 * @returns 금지어 포함 여부
 *
 * @example
 * ```typescript
 * containsBannedWords('bad word', ['bad', 'evil']); // true
 * containsBannedWords('good word', ['bad', 'evil']); // false
 * ```
 */
export const containsBannedWords = (value: string, bannedWords: string[]): boolean => {
  const lowerValue = value.toLowerCase();
  return bannedWords.some((word) => lowerValue.includes(word.toLowerCase()));
};

/**
 * 폼 필드 검증 결과 타입
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 이메일 필드 검증
 *
 * @param email - 이메일 주소
 * @returns 검증 결과
 */
export const validateEmail = (email: string): ValidationResult => {
  if (isEmpty(email)) {
    return { valid: false, error: '이메일을 입력해주세요' };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: '올바른 이메일 형식이 아닙니다' };
  }

  return { valid: true };
};

/**
 * 비밀번호 필드 검증
 *
 * @param password - 비밀번호
 * @returns 검증 결과
 */
export const validatePassword = (password: string): ValidationResult => {
  if (isEmpty(password)) {
    return { valid: false, error: '비밀번호를 입력해주세요' };
  }

  if (!isValidPassword(password)) {
    return {
      valid: false,
      error: '비밀번호는 8자 이상이며, 대문자/소문자/숫자/특수문자 중 3가지 이상을 포함해야 합니다',
    };
  }

  return { valid: true };
};

/**
 * 사용자명 필드 검증
 *
 * @param username - 사용자명
 * @returns 검증 결과
 */
export const validateUsername = (username: string): ValidationResult => {
  if (isEmpty(username)) {
    return { valid: false, error: '사용자명을 입력해주세요' };
  }

  if (!isValidUsername(username)) {
    return {
      valid: false,
      error: '사용자명은 2-20자의 영문, 숫자, 언더스코어만 사용 가능합니다',
    };
  }

  return { valid: true };
};
