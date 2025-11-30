import apiClient from './client';
import type { 
  LostItem, 
  CreateLostItemRequest,
  SearchLostItemRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
  ItemCategory,
  Statistics
} from '../types';

// 분실물 관련 API
export const lostItemApi = {
  // 분실물 등록 (습득자)
  createLostItem: async (itemData: CreateLostItemRequest): Promise<LostItem> => {
    const formData = new FormData();
    formData.append('itemName', itemData.itemName);
    formData.append('category', itemData.category);
    formData.append('description', itemData.description);
    formData.append('foundDate', itemData.foundDate);
    formData.append('location', itemData.location);
    
    if (itemData.latitude !== undefined && itemData.latitude !== null) {
      formData.append('latitude', itemData.latitude.toString());
    }
    
    if (itemData.longitude !== undefined && itemData.longitude !== null) {
      formData.append('longitude', itemData.longitude.toString());
    }
    
    if (itemData.brand) {
      formData.append('brand', itemData.brand);
    }
    
    if (itemData.image) {
      formData.append('image', itemData.image);
    }

    const response = await apiClient.post<ApiResponse<LostItem>>(
      '/api/v1/lost-items',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // 분실물 전체 조회 (페이징)
  getAllLostItems: async (
    pagination: PaginationParams = { page: 0, size: 20 }
  ): Promise<PaginatedResponse<LostItem>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LostItem>>>(
      `/api/v1/lost-items?page=${pagination.page}&size=${pagination.size}`
    );
    return response.data.data;
  },

  // 분실물 상세 조회
  getLostItemById: async (id: number): Promise<LostItem> => {
    const response = await apiClient.get<ApiResponse<LostItem>>(
      `/api/v1/lost-items/${id}`
    );
    return response.data.data;
  },

  // 카테고리별 필터링
  getLostItemsByCategory: async (
    category: ItemCategory,
    pagination: PaginationParams = { page: 0, size: 20 }
  ): Promise<PaginatedResponse<LostItem>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LostItem>>>(
      `/api/v1/lost-items/category/${category}?page=${pagination.page}&size=${pagination.size}`
    );
    return response.data.data;
  },

  // 날짜 범위별 필터링
  getLostItemsByDateRange: async (
    startDate: string,
    endDate: string,
    pagination: PaginationParams = { page: 0, size: 20 }
  ): Promise<PaginatedResponse<LostItem>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LostItem>>>(
      `/api/v1/lost-items/date-range?startDate=${startDate}&endDate=${endDate}&page=${pagination.page}&size=${pagination.size}`
    );
    return response.data.data;
  },

  // 장소별 필터링
  getLostItemsByLocation: async (
    location: string,
    pagination: PaginationParams = { page: 0, size: 20 }
  ): Promise<PaginatedResponse<LostItem>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LostItem>>>(
      `/api/v1/lost-items/location?location=${encodeURIComponent(location)}&page=${pagination.page}&size=${pagination.size}`
    );
    return response.data.data;
  },

  // 통합 필터링 (카테고리, 장소, 브랜드, 날짜 이후를 동시에 적용)
  filterLostItems: async (
    filters: {
      category?: ItemCategory;
      location?: string;
      brand?: string;
      foundDateAfter?: string;  // 해당 날짜 이후
      locationLatitude?: number;  // 장소 필터링용 좌표 (위도)
      locationLongitude?: number; // 장소 필터링용 좌표 (경도)
      locationRadius?: number;    // 반경 (미터, 기본값 10000m = 10km)
      page?: number;
      size?: number;
    }
  ): Promise<PaginatedResponse<LostItem>> => {
    const response = await apiClient.post<ApiResponse<PaginatedResponse<LostItem>>>(
      '/api/v1/lost-items/filter',
      {
        category: filters.category ?? null,
        location: filters.location ?? null,
        brand: filters.brand ?? null,
        foundDateAfter: filters.foundDateAfter ?? null,
        locationLatitude: filters.locationLatitude ?? null,
        locationLongitude: filters.locationLongitude ?? null,
        locationRadius: filters.locationRadius ?? null,
        page: filters.page ?? 0,
        size: filters.size ?? 20
      }
    );
    return response.data.data;
  },

  // AI 자연어 검색
  searchLostItems: async (searchRequest: SearchLostItemRequest): Promise<PaginatedResponse<LostItem>> => {
    const response = await apiClient.post<ApiResponse<PaginatedResponse<LostItem>>>(
      '/api/v1/lost-items/search',
      searchRequest
    );
    return response.data.data;
  },

  // 분실물 삭제
  deleteLostItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/lost-items/${id}`);
  },

  // 통계 데이터 조회
  getStatistics: async (): Promise<Statistics> => {
    const response = await apiClient.get<ApiResponse<Statistics>>('/api/v1/statistics');
    return response.data.data;
  }
};
