import { Link } from 'react-router-dom';
import { Search, Plus, User, Shield, Clock, MapPin, Package } from 'lucide-react';
import Button from '../components/common/Button';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 컴팩트한 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-purple-600">찾아낸 물건 찾기</h1>
            <div className="flex items-center space-x-4">
              <Link to="/lost-items/create" className="flex items-center text-sm text-gray-600 hover:text-purple-600">
                <Plus className="w-4 h-4 mr-1" />
                습득 등록
              </Link>
              <Link to="/auth/login" className="flex items-center text-sm text-gray-600 hover:text-purple-600">
                <User className="w-4 h-4 mr-1" />
                로그인
              </Link>
            </div>
          </div>
          <nav className="flex items-center space-x-6 mt-3">
            <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-purple-600">
              <MapPin className="w-4 h-4 mr-1" />
              찾아오시는길
            </Link>
            <Link to="/lost-items" className="flex items-center text-sm text-gray-600 hover:text-purple-600">
              <Search className="w-4 h-4 mr-1" />
              습득물 검색기
            </Link>
            <Link to="/mypage" className="flex items-center text-sm text-gray-600 hover:text-purple-600">
              <User className="w-4 h-4 mr-1" />
              마이페이지
            </Link>
          </nav>
        </div>
      </div>

      {/* 메인 콘텐츠 - 중앙에 예쁘게 배치 */}
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* 통합 검색 섹션 - 중앙에 예쁘게 배치 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">분실물 통합 검색</h2>
            <p className="text-gray-600">습득한 물건을 등록하거나 잃어버린 물건을 찾아보세요</p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">습득물명</label>
                <input 
                  type="text" 
                  placeholder="습득물명을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">습득지역</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>전체</option>
                  <option>서울</option>
                  <option>경기</option>
                  <option>인천</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">습득기간</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <option>전체</option>
                  <option>전자제품</option>
                  <option>의류</option>
                  <option>액세서리</option>
                  <option>서류</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button variant="primary" size="lg" className="px-8 py-3">
                <Search className="w-5 h-5 mr-2" />
                검색하기
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 콘텐츠 그리드 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 최근 등록된 습득물 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 등록된 습득물</h3>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Package className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">습득물 {item}</p>
                    <p className="text-xs text-gray-500">01-{10 + item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 주요 서비스 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 서비스</h3>
              <div className="space-y-4">
                <Link to="/lost-items" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">습득물 검색</p>
                    <p className="text-xs text-gray-600">등록된 습득물을 검색해보세요</p>
                  </div>
                </Link>
                
                <Link to="/lost-items/create" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">습득물 등록</p>
                    <p className="text-xs text-gray-600">습득한 물건을 등록하세요</p>
                  </div>
                </Link>
                
                <Link to="/mypage" className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">안전한 매칭</p>
                    <p className="text-xs text-gray-600">인증된 사용자 간 매칭</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">등록된 습득물</span>
                  <span className="text-sm font-semibold text-gray-900">1,234개</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">매칭 완료</span>
                  <span className="text-sm font-semibold text-gray-900">89건</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">신규 등록</span>
                  <span className="text-sm font-semibold text-green-600">+12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
