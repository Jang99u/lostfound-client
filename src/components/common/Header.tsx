import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  Bell, 
  Menu,
  X,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import Badge from './Badge';
import { useState } from 'react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/lost-items', label: '분실물 찾기', icon: Search },
    { path: '/notifications', label: '알림', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">분실물 찾기</h1>
              <p className="text-xs text-gray-500">AI 기반 매칭 서비스</p>
            </div>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-3">
            {/* 습득물 등록 버튼 */}
            <Button 
              variant="primary" 
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/lost-items/create')}
              className="hidden sm:flex"
            >
              습득물 등록
            </Button>

            {/* 사용자 메뉴 */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.loginId || '사용자'}
                  </span>
                </button>

                {/* 사용자 드롭다운 메뉴 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/mypage"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      내 보관함
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      설정
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<User className="w-4 h-4" />}
                onClick={() => navigate('/auth/login')}
              >
                로그인
              </Button>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  variant="primary" 
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    navigate('/lost-items/create');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  습득물 등록
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* 백드롭 */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;