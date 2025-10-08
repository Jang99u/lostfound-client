import apiClient from './client';
import type { User, MyPageData, ApiResponse } from '../types';

// 사용자 관련 API
export const userApi = {
  // 내 정보 조회
  getMyInfo: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/users/me');
    return response.data.data;
  },

  // 마이페이지 조회
  getMyPage: async (): Promise<MyPageData> => {
    const response = await apiClient.get<ApiResponse<MyPageData>>('/api/v1/users/mypage');
    return response.data.data;
  }
};
