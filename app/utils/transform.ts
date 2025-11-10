/**
 * 데이터 변환 유틸리티 함수
 */

/**
 * 객체의 키를 카멜케이스로 변환
 *
 * @param obj - 원본 객체
 * @returns 변환된 객체
 *
 * @example
 * ```typescript
 * toCamelCaseKeys({ first_name: 'John', last_name: 'Doe' });
 * // { firstName: 'John', lastName: 'Doe' }
 * ```
 */
export const toCamelCaseKeys = <T extends Record<string, any>>(obj: T): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCaseKeys(item));
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCaseKeys(obj[key]);
      return result;
    }, {} as any);
  }

  return obj;
};

/**
 * 객체의 키를 스네이크케이스로 변환
 *
 * @param obj - 원본 객체
 * @returns 변환된 객체
 *
 * @example
 * ```typescript
 * toSnakeCaseKeys({ firstName: 'John', lastName: 'Doe' });
 * // { first_name: 'John', last_name: 'Doe' }
 * ```
 */
export const toSnakeCaseKeys = <T extends Record<string, any>>(obj: T): any => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCaseKeys(item));
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = toSnakeCaseKeys(obj[key]);
      return result;
    }, {} as any);
  }

  return obj;
};

/**
 * 배열에서 중복 제거
 *
 * @param array - 원본 배열
 * @returns 중복이 제거된 배열
 *
 * @example
 * ```typescript
 * removeDuplicates([1, 2, 2, 3, 4, 4, 5]); // [1, 2, 3, 4, 5]
 * ```
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * 배열을 특정 키를 기준으로 그룹화
 *
 * @param array - 원본 배열
 * @param key - 그룹화할 키
 * @returns 그룹화된 객체
 *
 * @example
 * ```typescript
 * const users = [
 *   { id: 1, role: 'admin' },
 *   { id: 2, role: 'user' },
 *   { id: 3, role: 'admin' }
 * ];
 * groupBy(users, 'role');
 * // {
 * //   admin: [{ id: 1, role: 'admin' }, { id: 3, role: 'admin' }],
 * //   user: [{ id: 2, role: 'user' }]
 * // }
 * ```
 */
export const groupBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * 배열을 특정 크기의 청크로 나누기
 *
 * @param array - 원본 배열
 * @param size - 청크 크기
 * @returns 청크 배열
 *
 * @example
 * ```typescript
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * ```
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 배열 정렬
 *
 * @param array - 원본 배열
 * @param key - 정렬할 키
 * @param order - 정렬 순서 ('asc' | 'desc')
 * @returns 정렬된 배열
 *
 * @example
 * ```typescript
 * const users = [
 *   { name: 'Charlie', age: 30 },
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob', age: 35 }
 * ];
 * sortBy(users, 'age', 'asc');
 * // [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }, { name: 'Bob', age: 35 }]
 * ```
 */
export const sortBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * 배열 필터링 (null, undefined 제거)
 *
 * @param array - 원본 배열
 * @returns 필터링된 배열
 *
 * @example
 * ```typescript
 * compact([1, null, 2, undefined, 3]); // [1, 2, 3]
 * ```
 */
export const compact = <T>(array: (T | null | undefined)[]): T[] => {
  return array.filter((item): item is T => item !== null && item !== undefined);
};

/**
 * 객체에서 null/undefined 값 제거
 *
 * @param obj - 원본 객체
 * @returns 정제된 객체
 *
 * @example
 * ```typescript
 * omitEmpty({ a: 1, b: null, c: undefined, d: 2 }); // { a: 1, d: 2 }
 * ```
 */
export const omitEmpty = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] !== null && obj[key] !== undefined) {
      result[key as keyof T] = obj[key];
    }
    return result;
  }, {} as Partial<T>);
};

/**
 * 객체에서 특정 키 선택
 *
 * @param obj - 원본 객체
 * @param keys - 선택할 키 배열
 * @returns 선택된 키만 포함하는 객체
 *
 * @example
 * ```typescript
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
 * ```
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
};

/**
 * 객체에서 특정 키 제외
 *
 * @param obj - 원본 객체
 * @param keys - 제외할 키 배열
 * @returns 제외된 키를 제거한 객체
 *
 * @example
 * ```typescript
 * omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
 * ```
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * 깊은 복사
 *
 * @param obj - 복사할 객체
 * @returns 복사된 객체
 *
 * @example
 * ```typescript
 * const original = { a: { b: { c: 1 } } };
 * const copy = deepClone(original);
 * copy.a.b.c = 2;
 * console.log(original.a.b.c); // 1 (원본은 변경되지 않음)
 * ```
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as any;
  }

  return Object.keys(obj).reduce((result, key) => {
    result[key as keyof T] = deepClone((obj as any)[key]);
    return result;
  }, {} as T);
};

/**
 * 객체 병합 (깊은 병합)
 *
 * @param target - 대상 객체
 * @param source - 소스 객체
 * @returns 병합된 객체
 *
 * @example
 * ```typescript
 * const target = { a: { b: 1, c: 2 } };
 * const source = { a: { c: 3, d: 4 } };
 * deepMerge(target, source); // { a: { b: 1, c: 3, d: 4 } }
 * ```
 */
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = result[key as keyof T];
    const sourceValue = source[key as keyof T];

    if (
      targetValue &&
      sourceValue &&
      typeof targetValue === 'object' &&
      typeof sourceValue === 'object' &&
      !Array.isArray(targetValue) &&
      !Array.isArray(sourceValue)
    ) {
      result[key as keyof T] = deepMerge(targetValue, sourceValue);
    } else {
      result[key as keyof T] = sourceValue as any;
    }
  });

  return result;
};

/**
 * 배열을 맵으로 변환
 *
 * @param array - 원본 배열
 * @param keyField - 키로 사용할 필드
 * @returns 맵 객체
 *
 * @example
 * ```typescript
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * arrayToMap(users, 'id');
 * // { '1': { id: 1, name: 'Alice' }, '2': { id: 2, name: 'Bob' } }
 * ```
 */
export const arrayToMap = <T extends Record<string, any>>(
  array: T[],
  keyField: keyof T
): Record<string, T> => {
  return array.reduce((result, item) => {
    result[String(item[keyField])] = item;
    return result;
  }, {} as Record<string, T>);
};

/**
 * 배열 요소 이동
 *
 * @param array - 원본 배열
 * @param fromIndex - 현재 인덱스
 * @param toIndex - 이동할 인덱스
 * @returns 이동된 배열
 *
 * @example
 * ```typescript
 * moveItem([1, 2, 3, 4, 5], 0, 3); // [2, 3, 4, 1, 5]
 * ```
 */
export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

/**
 * 문자열을 파일명으로 변환 (공백 제거, 특수문자 치환)
 *
 * @param text - 원본 문자열
 * @returns 파일명으로 사용 가능한 문자열
 *
 * @example
 * ```typescript
 * toFilename('Hello World! (2025)'); // "hello-world-2025"
 * ```
 */
export const toFilename = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * 쿼리 문자열을 객체로 변환
 *
 * @param queryString - 쿼리 문자열
 * @returns 파싱된 객체
 *
 * @example
 * ```typescript
 * parseQueryString('?name=John&age=30');
 * // { name: 'John', age: '30' }
 * ```
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
};

/**
 * 객체를 쿼리 문자열로 변환
 *
 * @param obj - 객체
 * @returns 쿼리 문자열
 *
 * @example
 * ```typescript
 * toQueryString({ name: 'John', age: 30 }); // "name=John&age=30"
 * ```
 */
export const toQueryString = (obj: Record<string, any>): string => {
  return Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
};
