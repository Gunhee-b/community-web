import { Platform, Dimensions, StatusBar } from 'react-native';
import Constants from 'expo-constants';

/**
 * 플랫폼 관련 유틸리티 함수
 */

/**
 * 현재 플랫폼 확인
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/**
 * iOS 버전 확인 (iOS만 해당)
 *
 * @returns iOS 버전 또는 null
 */
export const getIOSVersion = (): number | null => {
  if (!isIOS) return null;
  const version = parseInt(Platform.Version as string, 10);
  return isNaN(version) ? null : version;
};

/**
 * Android 버전 확인 (Android만 해당)
 *
 * @returns Android API level 또는 null
 */
export const getAndroidVersion = (): number | null => {
  if (!isAndroid) return null;
  return typeof Platform.Version === 'number' ? Platform.Version : null;
};

/**
 * 화면 크기 가져오기
 *
 * @returns 화면 크기 객체
 *
 * @example
 * ```typescript
 * const { width, height } = getScreenDimensions();
 * console.log(`Screen: ${width}x${height}`);
 * ```
 */
export const getScreenDimensions = () => {
  return Dimensions.get('window');
};

/**
 * 스크린 너비
 */
export const screenWidth = Dimensions.get('window').width;

/**
 * 스크린 높이
 */
export const screenHeight = Dimensions.get('window').height;

/**
 * 화면 비율에 따른 크기 조정
 *
 * @param size - 기준 크기
 * @param baseWidth - 기준 화면 너비 (기본값: 375)
 * @returns 조정된 크기
 *
 * @example
 * ```typescript
 * const fontSize = scale(16); // 화면 크기에 따라 폰트 크기 조정
 * ```
 */
export const scale = (size: number, baseWidth: number = 375): number => {
  return (screenWidth / baseWidth) * size;
};

/**
 * 수직 크기 조정
 *
 * @param size - 기준 크기
 * @param baseHeight - 기준 화면 높이 (기본값: 812)
 * @returns 조정된 크기
 */
export const verticalScale = (size: number, baseHeight: number = 812): number => {
  return (screenHeight / baseHeight) * size;
};

/**
 * 중간 크기 조정 (scale과 verticalScale의 중간)
 *
 * @param size - 기준 크기
 * @param factor - 조정 비율 (0-1, 기본값: 0.5)
 * @returns 조정된 크기
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * 태블릿 여부 확인
 *
 * @returns 태블릿 여부
 */
export const isTablet = (): boolean => {
  const { width, height } = getScreenDimensions();
  const aspectRatio = Math.max(width, height) / Math.min(width, height);

  // 화면 비율이 1.6 미만이고 최소 너비가 600 이상이면 태블릿으로 간주
  return aspectRatio < 1.6 && Math.min(width, height) >= 600;
};

/**
 * 작은 화면 여부 확인 (iPhone SE 등)
 *
 * @returns 작은 화면 여부
 */
export const isSmallScreen = (): boolean => {
  return screenWidth < 375;
};

/**
 * 상태바 높이 가져오기
 *
 * @returns 상태바 높이
 */
export const getStatusBarHeight = (): number => {
  return isIOS ? (StatusBar.currentHeight || 20) : StatusBar.currentHeight || 0;
};

/**
 * 노치 유무 확인 (iPhone X 이상)
 *
 * @returns 노치 유무
 */
export const hasNotch = (): boolean => {
  if (!isIOS) return false;

  const { height, width } = getScreenDimensions();
  const version = getIOSVersion();

  // iPhone X 이상의 특징: 높이가 812 이상이거나 너비가 896 이상
  return (
    (version !== null && version >= 11) &&
    (height >= 812 || width >= 812)
  );
};

/**
 * Safe Area Insets 가져오기 (노치, 홈 바 등 고려)
 *
 * @returns Safe area insets 객체
 */
export const getSafeAreaInsets = () => {
  const statusBarHeight = getStatusBarHeight();
  const bottomInset = hasNotch() ? 34 : 0;

  return {
    top: statusBarHeight,
    bottom: bottomInset,
    left: 0,
    right: 0,
  };
};

/**
 * 앱 버전 가져오기
 *
 * @returns 앱 버전 문자열
 */
export const getAppVersion = (): string => {
  return Constants.expoConfig?.version || '1.0.0';
};

/**
 * 빌드 번호 가져오기
 *
 * @returns 빌드 번호
 */
export const getBuildNumber = (): string => {
  if (isIOS) {
    return Constants.expoConfig?.ios?.buildNumber || '1';
  }
  if (isAndroid) {
    return String(Constants.expoConfig?.android?.versionCode || 1);
  }
  return '1';
};

/**
 * 디바이스 정보 가져오기
 *
 * @returns 디바이스 정보 객체
 */
export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isTablet: isTablet(),
    screenWidth,
    screenHeight,
    statusBarHeight: getStatusBarHeight(),
    hasNotch: hasNotch(),
    appVersion: getAppVersion(),
    buildNumber: getBuildNumber(),
  };
};

/**
 * 디버그 모드 여부 확인
 *
 * @returns 디버그 모드 여부
 */
export const isDebugMode = (): boolean => {
  return __DEV__;
};

/**
 * 프로덕션 모드 여부 확인
 *
 * @returns 프로덕션 모드 여부
 */
export const isProductionMode = (): boolean => {
  return !__DEV__;
};

/**
 * 플랫폼별 값 선택
 *
 * @param options - 플랫폼별 값 객체
 * @returns 현재 플랫폼에 맞는 값
 *
 * @example
 * ```typescript
 * const padding = platformSelect({
 *   ios: 20,
 *   android: 16,
 *   default: 16
 * });
 * ```
 */
export const platformSelect = <T>(options: {
  ios?: T;
  android?: T;
  web?: T;
  default?: T;
}): T | undefined => {
  if (isIOS && options.ios !== undefined) return options.ios;
  if (isAndroid && options.android !== undefined) return options.android;
  if (isWeb && options.web !== undefined) return options.web;
  return options.default;
};

/**
 * 햅틱 피드백 지원 여부 확인
 *
 * @returns 햅틱 지원 여부
 */
export const supportsHaptics = (): boolean => {
  return isIOS || isAndroid;
};

/**
 * 다크 모드 지원 여부 확인
 *
 * @returns 다크 모드 지원 여부
 */
export const supportsDarkMode = (): boolean => {
  // iOS 13+ 또는 Android 10+
  const iosVersion = getIOSVersion();
  const androidVersion = getAndroidVersion();

  if (iosVersion !== null) {
    return iosVersion >= 13;
  }

  if (androidVersion !== null) {
    return androidVersion >= 29;
  }

  return false;
};

/**
 * 가로 모드 여부 확인
 *
 * @returns 가로 모드 여부
 */
export const isLandscape = (): boolean => {
  const { width, height } = getScreenDimensions();
  return width > height;
};

/**
 * 세로 모드 여부 확인
 *
 * @returns 세로 모드 여부
 */
export const isPortrait = (): boolean => {
  const { width, height } = getScreenDimensions();
  return width <= height;
};
