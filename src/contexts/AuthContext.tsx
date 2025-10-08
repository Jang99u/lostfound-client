import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../apis/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  register: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 로컬 스토리지에서 사용자 정보 확인
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (loginId: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Calling authApi.login with', { loginId, password });
      const response = await authApi.login({ loginId, password });
      console.log('AuthContext: Login response:', response);
      
      // JWT 토큰 저장
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // 사용자 정보는 토큰에서 추출하거나 별도 API로 가져오기
      // 현재는 loginId만 저장
      const userInfo: User = {
        id: loginId,
        email: '',
        name: loginId,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (loginId: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Calling authApi.register with', { loginId, password });
      const response = await authApi.register({ loginId, password });
      console.log('AuthContext: Register response:', response);
      
      // JWT 토큰 저장
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // 사용자 정보는 토큰에서 추출하거나 별도 API로 가져오기
      // 현재는 loginId만 저장
      const userInfo: User = {
        id: loginId,
        email: '',
        name: loginId,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
