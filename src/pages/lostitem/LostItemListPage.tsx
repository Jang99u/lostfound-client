import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, MapPin, Tag } from 'lucide-react';
import { ItemCategory, ItemStatus } from '../../types';

const LostItemListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 검색 로직 구현
    console.log('Search query:', searchQuery);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const mockLostItems = [
    {
      id: '1',
      title: '검은색 지갑',
      description: '지하철에서 발견한 검은색 지갑입니다.',
      category: ItemCategory.WALLET,
      location: '강남역',
      foundDate: '2024-01-15',
      status: ItemStatus.FOUND,
    },
    {
      id: '2',
      title: '아이폰 15',
      description: '카페에서 발견한 아이폰입니다.',
      category: ItemCategory.ELECTRONICS,
      location: '홍대입구역',
      foundDate: '2024-01-14',
      status: ItemStatus.FOUND,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              분실물 찾기
            </Link>
            <nav className="flex space-x-4">
              <Link
                to="/lost-items/create"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                습득물 등록
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8">
        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">분실물 검색</h2>
          
          {/* 검색창 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="자연어로 검색해보세요 (예: 지하철에서 발견한 검은 지갑)"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
              >
                검색
              </button>
            </div>
          </form>

          {/* 필터 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value={ItemCategory.ELECTRONICS}>전자제품</option>
                <option value={ItemCategory.CLOTHING}>의류</option>
                <option value={ItemCategory.ACCESSORIES}>액세서리</option>
                <option value={ItemCategory.DOCUMENTS}>서류</option>
                <option value={ItemCategory.BOOKS}>도서</option>
                <option value={ItemCategory.KEYS}>열쇠</option>
                <option value={ItemCategory.WALLET}>지갑</option>
                <option value={ItemCategory.OTHER}>기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                장소
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="예: 강남역"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value={ItemStatus.FOUND}>습득됨</option>
                <option value={ItemStatus.CLAIMED}>주인 찾음</option>
                <option value={ItemStatus.RETURNED}>반환됨</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 분실물 목록 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockLostItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === ItemStatus.FOUND ? 'bg-green-100 text-green-800' :
                  item.status === ItemStatus.CLAIMED ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status === ItemStatus.FOUND ? '습득됨' :
                   item.status === ItemStatus.CLAIMED ? '주인 찾음' : '반환됨'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  {item.category}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {item.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {item.foundDate}
                </div>
              </div>
              
              <div className="mt-4">
                <Link
                  to={`/lost-items/${item.id}`}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                >
                  자세히 보기
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="mt-8 flex justify-center">
          <nav className="flex space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              이전
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              다음
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
};

export default LostItemListPage;
