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
  ): Promise<{ locations: CustodyLocation[]; quotaExceeded: boolean }> => {
    const response = await apiClient.post<ApiResponse<CustodyLocation[]>>(
      '/api/v1/custody-locations/nearby',
      {
        latitude: request.latitude,
        longitude: request.longitude,
        topK: request.topK || 10
      }
    );
    // 헤더에서 쿼터 초과 상태 확인 (axios는 헤더 이름을 그대로 유지)
    const quotaExceeded = response.headers['x-tmap-quota-exceeded'] === 'true' || 
                          response.headers['X-TMap-Quota-Exceeded'] === 'true' ||
                          response.headers['X-TMAP-QUOTA-EXCEEDED'] === 'true';
    return {
      locations: response.data.data,
      quotaExceeded
    };
  },

  // 장소명 기반 가까운 보관소 검색
  findNearbyCustodyLocationsByPlaceName: async (
    placeName: string,
    topK?: number
  ): Promise<{ locations: CustodyLocation[]; quotaExceeded: boolean }> => {
    const response = await apiClient.get<ApiResponse<CustodyLocation[]>>(
      '/api/v1/custody-locations/nearby-by-place',
      {
        params: {
          placeName,
          topK: topK || 5
        }
      }
    );
    // 헤더에서 쿼터 초과 상태 확인 (axios는 헤더 이름을 그대로 유지)
    const quotaExceeded = response.headers['x-tmap-quota-exceeded'] === 'true' || 
                          response.headers['X-TMap-Quota-Exceeded'] === 'true' ||
                          response.headers['X-TMAP-QUOTA-EXCEEDED'] === 'true';
    return {
      locations: response.data.data,
      quotaExceeded
    };
  }
};

