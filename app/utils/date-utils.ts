import {
  format,
  formatDistance,
  formatDistanceToNow,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
} from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜 포맷 상수
 */
export const DATE_FORMATS = {
  FULL: 'yyyy년 MM월 dd일 HH:mm',
  DATE_ONLY: 'yyyy년 MM월 dd일',
  TIME_ONLY: 'HH:mm',
  DATE_TIME: 'yyyy-MM-dd HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  SHORT_DATE: 'MM/dd',
  MONTH_DAY: 'M월 d일',
  YEAR_MONTH_DAY: 'yyyy.MM.dd',
} as const;

/**
 * 날짜를 지정된 형식으로 포맷팅
 *
 * @param date - 날짜 객체 또는 ISO 문자열
 * @param formatStr - 포맷 문자열 (기본값: 'yyyy년 MM월 dd일')
 * @returns 포맷팅된 날짜 문자열
 *
 * @example
 * ```typescript
 * formatDate(new Date()); // "2025년 11월 08일"
 * formatDate('2025-11-08T10:30:00', DATE_FORMATS.FULL); // "2025년 11월 08일 10:30"
 * ```
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = DATE_FORMATS.DATE_ONLY
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ko });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * 상대 시간 포맷 (예: "3분 전", "2시간 전")
 *
 * @param date - 날짜 객체 또는 ISO 문자열
 * @param baseDate - 기준 날짜 (기본값: 현재 시간)
 * @returns 상대 시간 문자열
 *
 * @example
 * ```typescript
 * formatRelativeTime('2025-11-08T10:00:00'); // "30분 전"
 * formatRelativeTime('2025-11-07T10:00:00'); // "1일 전"
 * ```
 */
export const formatRelativeTime = (date: Date | string, baseDate: Date = new Date()): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, baseDate, { locale: ko, addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * 지금부터의 상대 시간 (간단 버전)
 *
 * @param date - 날짜 객체 또는 ISO 문자열
 * @returns 상대 시간 문자열
 *
 * @example
 * ```typescript
 * getTimeAgo('2025-11-08T10:00:00'); // "30분 전"
 * ```
 */
export const getTimeAgo = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { locale: ko, addSuffix: true });
  } catch (error) {
    console.error('Error getting time ago:', error);
    return '';
  }
};

/**
 * D-Day 계산 (남은 일수)
 *
 * @param targetDate - 목표 날짜
 * @returns D-Day 문자열 (예: "D-3", "D-Day", "D+2")
 *
 * @example
 * ```typescript
 * getDday('2025-11-10'); // "D-2"
 * getDday('2025-11-08'); // "D-Day"
 * getDday('2025-11-06'); // "D+2"
 * ```
 */
export const getDday = (targetDate: Date | string): string => {
  try {
    const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
    const today = startOfDay(new Date());
    const targetDay = startOfDay(target);

    const days = differenceInDays(targetDay, today);

    if (days === 0) return 'D-Day';
    if (days > 0) return `D-${days}`;
    return `D+${Math.abs(days)}`;
  } catch (error) {
    console.error('Error calculating D-Day:', error);
    return '';
  }
};

/**
 * 스마트 날짜 포맷
 * - 오늘: "오늘 HH:mm"
 * - 어제: "어제 HH:mm"
 * - 이번주: "요일 HH:mm"
 * - 이번년도: "MM월 dd일"
 * - 그 외: "yyyy.MM.dd"
 *
 * @param date - 날짜 객체 또는 ISO 문자열
 * @returns 스마트 포맷팅된 날짜 문자열
 *
 * @example
 * ```typescript
 * smartFormatDate('2025-11-08T10:30:00'); // "오늘 10:30"
 * smartFormatDate('2025-11-07T10:30:00'); // "어제 10:30"
 * smartFormatDate('2025-11-05T10:30:00'); // "화요일 10:30"
 * smartFormatDate('2024-11-08T10:30:00'); // "2024.11.08"
 * ```
 */
export const smartFormatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `오늘 ${format(dateObj, 'HH:mm')}`;
    }

    if (isYesterday(dateObj)) {
      return `어제 ${format(dateObj, 'HH:mm')}`;
    }

    if (isTomorrow(dateObj)) {
      return `내일 ${format(dateObj, 'HH:mm')}`;
    }

    if (isThisWeek(dateObj)) {
      return format(dateObj, 'EEEE HH:mm', { locale: ko });
    }

    if (isThisYear(dateObj)) {
      return format(dateObj, 'M월 d일', { locale: ko });
    }

    return format(dateObj, 'yyyy.MM.dd');
  } catch (error) {
    console.error('Error in smart format date:', error);
    return '';
  }
};

/**
 * 두 날짜 사이의 기간 계산
 *
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 기간 문자열 (예: "2일 3시간", "30분")
 *
 * @example
 * ```typescript
 * getDuration('2025-11-08T10:00:00', '2025-11-10T13:30:00'); // "2일 3시간"
 * ```
 */
export const getDuration = (startDate: Date | string, endDate: Date | string): string => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

    const days = differenceInDays(end, start);
    const hours = differenceInHours(end, start) % 24;
    const minutes = differenceInMinutes(end, start) % 60;

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}일`);
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0 && days === 0) parts.push(`${minutes}분`);

    return parts.length > 0 ? parts.join(' ') : '0분';
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '';
  }
};

/**
 * 날짜가 유효한지 확인
 *
 * @param date - 검사할 날짜
 * @returns 유효성 여부
 *
 * @example
 * ```typescript
 * isValidDate('2025-11-08'); // true
 * isValidDate('invalid'); // false
 * ```
 */
export const isValidDate = (date: any): boolean => {
  try {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
};

/**
 * ISO 8601 형식으로 변환
 *
 * @param date - 날짜 객체
 * @returns ISO 8601 문자열
 *
 * @example
 * ```typescript
 * toISOString(new Date()); // "2025-11-08T10:30:00.000Z"
 * ```
 */
export const toISOString = (date: Date): string => {
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting to ISO string:', error);
    return '';
  }
};

/**
 * 날짜 범위 생성
 *
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 날짜 배열
 *
 * @example
 * ```typescript
 * const range = getDateRange('2025-11-08', '2025-11-10');
 * // [Date(2025-11-08), Date(2025-11-09), Date(2025-11-10)]
 * ```
 */
export const getDateRange = (start: Date | string, end: Date | string): Date[] => {
  try {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;

    const dates: Date[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  } catch (error) {
    console.error('Error getting date range:', error);
    return [];
  }
};

/**
 * 날짜 비교
 *
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 * @returns 비교 결과 (-1: date1이 이전, 0: 같음, 1: date1이 이후)
 */
export const compareDates = (date1: Date | string, date2: Date | string): number => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;

    const time1 = d1.getTime();
    const time2 = d2.getTime();

    if (time1 < time2) return -1;
    if (time1 > time2) return 1;
    return 0;
  } catch (error) {
    console.error('Error comparing dates:', error);
    return 0;
  }
};

/**
 * 날짜가 과거인지 확인
 *
 * @param date - 확인할 날짜
 * @returns 과거 여부
 */
export const isPast = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj.getTime() < Date.now();
  } catch (error) {
    console.error('Error checking if past:', error);
    return false;
  }
};

/**
 * 날짜가 미래인지 확인
 *
 * @param date - 확인할 날짜
 * @returns 미래 여부
 */
export const isFuture = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj.getTime() > Date.now();
  } catch (error) {
    console.error('Error checking if future:', error);
    return false;
  }
};
