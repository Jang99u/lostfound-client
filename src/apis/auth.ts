import apiClient from './client';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '../types';

// 인증 관련 API
export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/api/v1/auth/sign-in', credentials);
      
      // ResponseInterceptor가 모든 응답을 BaseResponse로 감싸므로
      // 실제 토큰은 response.data.data에 있음
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const tokenData = response.data.data;
      
      if (!tokenData || typeof tokenData !== 'object') {
        throw new Error('Invalid token data received from server');
      }
      
      if (!tokenData.accessToken || typeof tokenData.accessToken !== 'string') {
        throw new Error('Invalid accessToken received from server');
      }
      
      return {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken
      };
    } catch (error) {
      console.error('❌ Login API error:', error);
      throw error;
    }
  },

  // 회원가입
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/sign-up', userData);
    
    // ResponseInterceptor가 모든 응답을 BaseResponse로 감싸므로
    // 실제 토큰은 response.data.data에 있음
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    const tokenData = response.data.data;
    if (!tokenData || typeof tokenData !== 'object') {
      throw new Error('Invalid token data received from server');
    }
    
    if (!tokenData.accessToken || typeof tokenData.accessToken !== 'string') {
      throw new Error('Invalid accessToken received from server');
    }
    
    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken
    };
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // 토큰 갱신
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  }
};
