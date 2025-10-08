import apiClient from './client';
import type { 
  LostItem, 
  CreateLostItemRequest,
  SearchLostItemRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
  ItemCategory
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
  }
};
