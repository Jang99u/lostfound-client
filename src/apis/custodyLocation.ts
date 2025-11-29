import apiClient from './client';
import type { ApiResponse } from '../types';

export interface CustodyLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  itemCount: number;
  walkingDistance?: number; // 미터
  walkingTime?: number; // 분
}

export interface NearbyCustodyLocationRequest {
  latitude: number;
  longitude: number;
  topK?: number;
}

// 보관장소 관련 API
export const custodyLocationApi = {
  // 모든 보관소 목록 조회 (드롭다운용)
  getAllCustodyLocations: async (): Promise<CustodyLocation[]> => {
    const response = await apiClient.get<ApiResponse<CustodyLocation[]>>(
      '/api/v1/custody-locations'
    );
    return response.data.data;
  },

  // 사용자 위치 기준 가까운 보관소 검색
  findNearbyCustodyLocations: async (
    request: NearbyCustodyLocationRequest
  ): Promise<CustodyLocation[]> => {
    const response = await apiClient.post<ApiResponse<CustodyLocation[]>>(
      '/api/v1/custody-locations/nearby',
      {
        latitude: request.latitude,
        longitude: request.longitude,
        topK: request.topK || 10
      }
    );
    return response.data.data;
  }
};

