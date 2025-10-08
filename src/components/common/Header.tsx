import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '분실물 종합 안내', icon: Home },
    { path: '/lost-items', label: '습득 분실물 모음', icon: Search },
    { path: '/mypage', label: '마이페이지', icon: User },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">분실물 찾기</h1>
          </Link>

          {/* 메인 네비게이션 */}
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
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
          <div className="flex items-center space-x-4">
            <Link 
              to="/lost-items/create" 
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              습득물 등록
            </Link>
            <Link 
              to="/auth/login" 
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              로그인
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
