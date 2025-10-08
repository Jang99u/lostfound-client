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
    console.log('authApi.login: Sending request to /api/v1/auth/sign-in with', credentials);
    const response = await apiClient.post('/api/v1/auth/sign-in', credentials);
    console.log('authApi.login: Response received', response.data);
    return response.data;
  },

  // 회원가입
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    console.log('authApi.register: Sending request to /api/v1/auth/sign-up with', userData);
    const response = await apiClient.post('/api/v1/auth/sign-up', userData);
    console.log('authApi.register: Response received', response.data);
    return response.data;
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
