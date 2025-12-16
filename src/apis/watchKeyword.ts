import apiClient from './client';
import type { ApiResponse } from '../types';
import type { WatchKeyword, CreateWatchKeywordRequest } from '../types';

// 키워드 감시 관련 API
export const watchKeywordApi = {
  // 키워드 등록
  createWatchKeyword: async (data: CreateWatchKeywordRequest): Promise<WatchKeyword> => {
    const response = await apiClient.post<ApiResponse<WatchKeyword>>(
      '/api/v1/watch-keywords',
      data
    );
    return response.data.data;
  },

  // 키워드 목록 조회 (활성화된 것만)
  getWatchKeywords: async (): Promise<WatchKeyword[]> => {
    const response = await apiClient.get<ApiResponse<WatchKeyword[]>>(
      '/api/v1/watch-keywords'
    );
    return response.data.data;
  },

  // 모든 키워드 조회 (비활성화 포함)
  getAllWatchKeywords: async (): Promise<WatchKeyword[]> => {
    const response = await apiClient.get<ApiResponse<WatchKeyword[]>>(
      '/api/v1/watch-keywords/all'
    );
    return response.data.data;
  },

  // 키워드 삭제 (비활성화)
  deleteWatchKeyword: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/watch-keywords/${id}`);
  },

  // 키워드 재활성화
  activateWatchKeyword: async (id: number): Promise<void> => {
    await apiClient.put(`/api/v1/watch-keywords/${id}/activate`);
  }
};


