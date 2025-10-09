import apiClient from './client';
import type { ClaimRequest, CreateClaimRequest, ApiResponse } from '../types';

// 회수 요청 관련 API
export const claimApi = {
  // 회수 요청 생성
  createClaimRequest: async (lostItemId: number, data: CreateClaimRequest): Promise<ClaimRequest> => {
    const response = await apiClient.post<ApiResponse<ClaimRequest>>(
      `/api/v1/claims/lost-items/${lostItemId}`,
      data
    );
    return response.data.data;
  },

  // 회수 요청 승인
  approveClaimRequest: async (claimId: number): Promise<ClaimRequest> => {
    const response = await apiClient.put<ClaimRequest>(`/api/v1/claims/${claimId}/approve`);
    return response.data;
  },

  // 회수 요청 거절
  rejectClaimRequest: async (claimId: number): Promise<ClaimRequest> => {
    const response = await apiClient.put<ClaimRequest>(`/api/v1/claims/${claimId}/reject`);
    return response.data;
  },

  // 분실물에 대한 회수 요청 목록
  getClaimRequestsByLostItem: async (lostItemId: number): Promise<ClaimRequest[]> => {
    const response = await apiClient.get<ApiResponse<ClaimRequest[]>>(
      `/api/v1/claims/lost-items/${lostItemId}`
    );
    return response.data.data;
  },

  // 내가 받은 회수 요청 목록
  getReceivedClaimRequests: async (): Promise<ClaimRequest[]> => {
    const response = await apiClient.get<ApiResponse<ClaimRequest[]>>(
      '/api/v1/claims/received'
    );
    return response.data.data;
  },

  // 내가 보낸 회수 요청 목록
  getSentClaimRequests: async (): Promise<ClaimRequest[]> => {
    const response = await apiClient.get<ApiResponse<ClaimRequest[]>>(
      '/api/v1/claims/sent'
    );
    return response.data.data;
  }
};
