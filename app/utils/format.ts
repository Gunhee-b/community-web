/**
 * 데이터 포맷팅 유틸리티 함수
 */

/**
 * 숫자를 한국 통화 형식으로 포맷팅
 *
 * @param amount - 금액
 * @param symbol - 통화 기호 (기본값: '원')
 * @returns 포맷팅된 금액 문자열
 *
 * @example
 * ```typescript
 * formatCurrency(1000000); // "1,000,000원"
 * formatCurrency(50000, '$'); // "$50,000"
 * ```
 */
export const formatCurrency = (amount: number, symbol: string = '원'): string => {
  const formatted = new Intl.NumberFormat('ko-KR').format(amount);
  return symbol === '원' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
};

/**
 * 숫자에 천 단위 구분자 추가
 *
 * @param value - 숫자
 * @returns 포맷팅된 문자열
 *
 * @example
 * ```typescript
 * formatNumber(1234567); // "1,234,567"
 * ```
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR').format(value);
};

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param bytes - 바이트 크기
 * @param decimals - 소수점 자리수 (기본값: 2)
 * @returns 포맷팅된 파일 크기 문자열
 *
 * @example
 * ```typescript
 * formatFileSize(1024); // "1 KB"
 * formatFileSize(1048576); // "1 MB"
 * formatFileSize(1073741824); // "1 GB"
 * ```
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 백분율 포맷팅
 *
 * @param value - 값 (0-100)
 * @param decimals - 소수점 자리수 (기본값: 1)
 * @returns 포맷팅된 백분율 문자열
 *
 * @example
 * ```typescript
 * formatPercentage(75.5); // "75.5%"
 * formatPercentage(100); // "100.0%"
 * ```
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * 전화번호 포맷팅
 *
 * @param phone - 전화번호 (숫자만)
 * @returns 포맷팅된 전화번호
 *
 * @example
 * ```typescript
 * formatPhoneNumber('01012345678'); // "010-1234-5678"
 * formatPhoneNumber('0212345678'); // "02-1234-5678"
 * ```
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  // 010으로 시작하는 휴대폰 번호
  if (cleaned.startsWith('010')) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // 서울 지역번호 (02)
  if (cleaned.startsWith('02')) {
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // 기타 지역번호
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

/**
 * 긴 텍스트 말줄임 처리
 *
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @param suffix - 말줄임 기호 (기본값: '...')
 * @returns 잘린 텍스트
 *
 * @example
 * ```typescript
 * truncateText('This is a very long text', 10); // "This is a..."
 * truncateText('Short', 10); // "Short"
 * ```
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 문자열의 첫 글자를 대문자로 변환
 *
 * @param text - 원본 텍스트
 * @returns 첫 글자가 대문자인 텍스트
 *
 * @example
 * ```typescript
 * capitalize('hello'); // "Hello"
 * capitalize('WORLD'); // "WORLD"
 * ```
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * 카멜케이스를 스네이크케이스로 변환
 *
 * @param text - 카멜케이스 문자열
 * @returns 스네이크케이스 문자열
 *
 * @example
 * ```typescript
 * toSnakeCase('firstName'); // "first_name"
 * toSnakeCase('userId'); // "user_id"
 * ```
 */
export const toSnakeCase = (text: string): string => {
  return text.replace(/([A-Z])/g, '_$1').toLowerCase();
};

/**
 * 스네이크케이스를 카멜케이스로 변환
 *
 * @param text - 스네이크케이스 문자열
 * @returns 카멜케이스 문자열
 *
 * @example
 * ```typescript
 * toCamelCase('first_name'); // "firstName"
 * toCamelCase('user_id'); // "userId"
 * ```
 */
export const toCamelCase = (text: string): string => {
  return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * 숫자를 축약형으로 포맷팅
 *
 * @param num - 숫자
 * @returns 축약된 문자열
 *
 * @example
 * ```typescript
 * formatCompactNumber(1234); // "1.2K"
 * formatCompactNumber(1000000); // "1M"
 * formatCompactNumber(1500000000); // "1.5B"
 * ```
 */
export const formatCompactNumber = (num: number): string => {
  if (num < 1000) return num.toString();

  const units = ['', 'K', 'M', 'B', 'T'];
  const order = Math.floor(Math.log10(num) / 3);
  const unitName = units[order];
  const value = (num / Math.pow(1000, order)).toFixed(1);

  return `${value}${unitName}`;
};

/**
 * 배열을 콤마로 구분된 문자열로 변환
 *
 * @param items - 배열
 * @param separator - 구분자 (기본값: ', ')
 * @returns 문자열
 *
 * @example
 * ```typescript
 * joinArray(['apple', 'banana', 'cherry']); // "apple, banana, cherry"
 * joinArray([1, 2, 3], ' - '); // "1 - 2 - 3"
 * ```
 */
export const joinArray = (items: any[], separator: string = ', '): string => {
  return items.join(separator);
};

/**
 * 이름 마스킹 (개인정보 보호)
 *
 * @param name - 이름
 * @returns 마스킹된 이름
 *
 * @example
 * ```typescript
 * maskName('홍길동'); // "홍*동"
 * maskName('John Doe'); // "J*****e"
 * ```
 */
export const maskName = (name: string): string => {
  if (name.length <= 2) return name;

  const first = name.charAt(0);
  const last = name.charAt(name.length - 1);
  const middle = '*'.repeat(name.length - 2);

  return `${first}${middle}${last}`;
};

/**
 * 이메일 마스킹
 *
 * @param email - 이메일 주소
 * @returns 마스킹된 이메일
 *
 * @example
 * ```typescript
 * maskEmail('user@example.com'); // "u***@example.com"
 * ```
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const maskedLocal =
    local.length > 3 ? local.charAt(0) + '*'.repeat(3) : local.charAt(0) + '***';

  return `${maskedLocal}@${domain}`;
};

/**
 * 전화번호 마스킹
 *
 * @param phone - 전화번호
 * @returns 마스킹된 전화번호
 *
 * @example
 * ```typescript
 * maskPhoneNumber('010-1234-5678'); // "010-****-5678"
 * ```
 */
export const maskPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
};

/**
 * 시간을 읽기 쉬운 형식으로 변환
 *
 * @param seconds - 초 단위 시간
 * @returns 포맷팅된 시간 문자열
 *
 * @example
 * ```typescript
 * formatDuration(65); // "1분 5초"
 * formatDuration(3665); // "1시간 1분"
 * ```
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (secs > 0 && hours === 0) parts.push(`${secs}초`);

  return parts.length > 0 ? parts.join(' ') : '0초';
};
