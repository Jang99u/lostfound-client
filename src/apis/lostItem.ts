import apiClient from './client';
import type { 
  LostItem, 
  CreateLostItemRequest, 
  LostItemFilters, 
  PaginatedResponse,
  PaginationParams 
} from '../types';

// 분실물 관련 API
export const lostItemApi = {
  // 분실물 목록 조회 (필터링 및 페이지네이션)
  getLostItems: async (
    filters: LostItemFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<LostItem>> => {
    const params = new URLSearchParams();
    
    // 필터 파라미터 추가
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // 페이지네이션 파라미터 추가
    params.append('page', pagination.page.toString());
    params.append('limit', pagination.limit.toString());
    
    const response = await apiClient.get(`/lost-items?${params.toString()}`);
    return response.data;
  },

  // 분실물 상세 조회
  getLostItemById: async (id: string): Promise<LostItem> => {
    const response = await apiClient.get(`/lost-items/${id}`);
    return response.data;
  },

  // 분실물 등록 (습득자)
  createLostItem: async (itemData: CreateLostItemRequest): Promise<LostItem> => {
    const response = await apiClient.post('/lost-items', itemData);
    return response.data;
  },

  // 분실물 수정
  updateLostItem: async (id: string, itemData: Partial<CreateLostItemRequest>): Promise<LostItem> => {
    const response = await apiClient.put(`/lost-items/${id}`, itemData);
    return response.data;
  },

  // 분실물 삭제
  deleteLostItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/lost-items/${id}`);
  },

  // 자연어 검색
  searchLostItems: async (query: string): Promise<LostItem[]> => {
    const response = await apiClient.get(`/lost-items/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // 내가 등록한 분실물 목록
  getMyLostItems: async (): Promise<LostItem[]> => {
    const response = await apiClient.get('/lost-items/my');
    return response.data;
  },

  // 분실물 주인 찾기 신청
  claimLostItem: async (id: string, contactInfo: { phone: string; message?: string }): Promise<void> => {
    await apiClient.post(`/lost-items/${id}/claim`, contactInfo);
  }
};
