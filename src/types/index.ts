// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

// 분실물 관련 타입
export interface LostItem {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  foundDate: string;
  imageUrls?: string[];
  status: ItemStatus;
  finderId: string;
  finder?: User;
  createdAt: string;
  updatedAt: string;
}

// 분실물 카테고리
export const ItemCategory = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  ACCESSORIES: 'accessories',
  DOCUMENTS: 'documents',
  BOOKS: 'books',
  KEYS: 'keys',
  WALLET: 'wallet',
  OTHER: 'other'
} as const;

export type ItemCategory = typeof ItemCategory[keyof typeof ItemCategory];

// 분실물 상태
export const ItemStatus = {
  FOUND: 'found',        // 습득됨
  CLAIMED: 'claimed',    // 주인을 찾음
  RETURNED: 'returned'   // 반환됨
} as const;

export type ItemStatus = typeof ItemStatus[keyof typeof ItemStatus];

// 인증 관련 타입
export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface RegisterRequest {
  loginId: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 필터링 타입
export interface LostItemFilters {
  category?: ItemCategory;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: ItemStatus;
  search?: string;
}

// 분실물 등록 요청 타입
export interface CreateLostItemRequest {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  foundDate: string;
  imageUrls?: string[];
}
