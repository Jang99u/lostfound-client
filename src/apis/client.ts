import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL;

// 디버깅용 로그
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('🔧 Mode:', import.meta.env.MODE);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120초 (2분) - TMap API 호출이 오래 걸릴 수 있음
});

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // 현재 경로가 로그인이 필요한 페이지인지 확인
      const publicPaths = ['/', '/lost-items', '/auth/login'];
      const currentPath = window.location.pathname;
      
      // 로그인이 필요한 페이지(예: 마이페이지, 알림 등)일 때만 로그인 페이지로 리다이렉트
      if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/lost-items/')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
