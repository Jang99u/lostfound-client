import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 클래스명을 조건부로 결합하는 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 중복 클래스를 자동으로 제거
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜를 상대적 시간으로 포맷팅 (예: "2시간 전", "3일 전")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}일 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}년 전`;
}

/**
 * 숫자를 천 단위 콤마로 포맷팅
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 문자열을 지정된 길이로 자르고 말줄임표 추가
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * URL에서 쿼리 파라미터를 추출
 */
export function getQueryParams(url: string): Record<string, string> {
  const params = new URLSearchParams(url.split('?')[1]);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

/**
 * 객체를 쿼리 스트링으로 변환
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 스로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 랜덤 ID 생성
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * 배열을 청크로 나누기
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * 배열에서 중복 제거
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 객체의 깊은 복사
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}
