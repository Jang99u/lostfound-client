// 사용자 관련 타입
export interface User {
  id: string;
  loginId: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

// 분실물 카테고리 (LostItem보다 먼저 정의)
export const ITEM_CATEGORIES = {
  WALLET: 'WALLET',
  PHONE: 'PHONE',
  CARD: 'CARD',
  BAG: 'BAG',
  CLOTHING: 'CLOTHING',
  ETC: 'ETC'
} as const;

export type ItemCategory = typeof ITEM_CATEGORIES[keyof typeof ITEM_CATEGORIES];

export const ItemCategoryLabels: Record<ItemCategory, string> = {
  [ITEM_CATEGORIES.WALLET]: '지갑',
  [ITEM_CATEGORIES.PHONE]: '휴대폰',
  [ITEM_CATEGORIES.CARD]: '카드',
  [ITEM_CATEGORIES.BAG]: '가방',
  [ITEM_CATEGORIES.CLOTHING]: '의류',
  [ITEM_CATEGORIES.ETC]: '기타'
};

// 분실물 상태 타입
export type LostItemStatus = 'REGISTERED' | 'MATCHED' | 'COMPLETED' | 'EXPIRED';

// 회수 요청 상태 타입
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

// 분실물 관련 타입
export interface LostItem {
  id: number;
  itemName: string;
  category: ItemCategory;
  description: string;
  foundDate: string;
  location: string;
  imageUrl?: string;
  embeddingId?: number;
  status?: LostItemStatus;
  userId?: number;  // 작성자 ID
}

// 회수 요청 타입
export interface ClaimRequest {
  id: number;
  lostItemId: number;
  lostItemName: string;
  claimerId: number;
  claimerLoginId: string;
  status: ClaimStatus;
  message: string;
  createdAt: string;
}

// 회수 요청 생성
export interface CreateClaimRequest {
  message: string;
}

// 통계 데이터
export interface Statistics {
  totalItems: number;
  matchedItems: number;
  completedItems: number;
  newItemsToday: number;
}

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
  message: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  size: number;
}

// 필터링 타입
export interface LostItemFilters {
  category?: ItemCategory;
  location?: string;
  startDate?: string;
  endDate?: string;
}

// 분실물 등록 요청 타입
export interface CreateLostItemRequest {
  itemName: string;
  category: ItemCategory;
  description: string;
  foundDate: string;
  location: string;
  image?: File;
}

// 검색 요청 타입
export interface SearchLostItemRequest {
  query: string;
  topK?: number;
}

// 마이페이지 타입
export interface MyPageData {
  user: User;
  lostItems: LostItem[];
  totalCount: number;
  receivedClaimRequests: ClaimRequest[];
  pendingClaimCount: number;
}
