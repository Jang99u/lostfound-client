import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MapPin, 
  Calendar, 
  Package, 
  Clock,
  X,
  Sparkles
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { lostItemApi } from '../../apis/lostItem';
import { ItemCategoryLabels } from '../../types';
import type { ItemCategory, LostItem } from '../../types';
import { formatRelativeTime, formatNumber } from '../../utils/cn';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'location' | 'category';

const LostItemListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 상태 관리
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 전체 아이템 가져오기
  const fetchAllItems = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError('');
    setIsSearchMode(false);

    try {
      const result = await lostItemApi.getAllLostItems({ page, size: 20 });
      setItems(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.ceil((result.totalCount || 0) / 20));
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Failed to fetch items:', err);
      setError('분실물 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 검색 실행
  const performSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      await fetchAllItems();
      return;
    }

    setIsSearchMode(true);
    setLoading(true);
    setError('');

    try {
      const result = await lostItemApi.searchLostItems({ query: trimmed, topK: 50 });
      setItems(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(0); // 검색 결과는 페이징 없음
      setCurrentPage(0);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError('검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [fetchAllItems]);

  // 필터 적용
  const applyFilters = async () => {
    setLoading(true);
    setError('');
    setIsSearchMode(false);

    try {
      let result;
      
      if (selectedCategory) {
        result = await lostItemApi.getLostItemsByCategory(selectedCategory, { page: 0, size: 20 });
      } else if (selectedLocation) {
        result = await lostItemApi.getLostItemsByLocation(selectedLocation, { page: 0, size: 20 });
      } else if (startDate && endDate) {
        result = await lostItemApi.getLostItemsByDateRange(startDate, endDate, { page: 0, size: 20 });
      } else {
        result = await lostItemApi.getAllLostItems({ page: 0, size: 20 });
      }

      setItems(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.ceil((result.totalCount || 0) / 20));
      setCurrentPage(0);
    } catch (err: any) {
      console.error('Filter failed:', err);
      setError('필터 적용에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 초기화
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setStartDate('');
    setEndDate('');
    void fetchAllItems();
  };

  // 정렬 적용
  const applySorting = (items: LostItem[]) => {
    const sorted = [...items];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.foundDate).getTime() - new Date(a.foundDate).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.foundDate).getTime() - new Date(b.foundDate).getTime());
      case 'location':
        return sorted.sort((a, b) => a.location.localeCompare(b.location));
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return sorted;
    }
  };

  // 초기 로드 및 URL 상태 기반 검색 처리
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchQuery) {
      setSearchQuery(state.searchQuery);
      void performSearch(state.searchQuery);
    } else {
      void fetchAllItems();
    }
    if (state?.category) setSelectedCategory(state.category);
    if (state?.location) setSelectedLocation(state.location);
  }, [location.state, fetchAllItems, performSearch]);

  // 정렬된 아이템
  const sortedItems = isSearchMode ? items : applySorting(items);

  // 카테고리 옵션
  const categoryOptions = Object.entries(ItemCategoryLabels).map(([key, label]) => ({
    value: key,
    label
  }));

  // 활성 필터 개수
  const activeFiltersCount = [
    selectedCategory,
    selectedLocation,
    startDate,
    endDate
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                분실물 찾기
              </h1>
              <p className="text-gray-600 mt-1">
                {isSearchMode 
                  ? `"${searchQuery}" 검색 결과 ${formatNumber(totalCount)}건`
                  : `총 ${formatNumber(totalCount)}개의 분실물이 등록되어 있습니다`
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 정렬 옵션 */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="location">장소순</option>
                  <option value="category">카테고리순</option>
                </select>
              </div>

              {/* 뷰 모드 토글 */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* 필터 버튼 */}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(true)}
              >
                필터
                {activeFiltersCount > 0 && (
                  <Badge variant="error" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="자연어로 검색해보세요 (예: 지하철에서 발견한 검은 지갑)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void performSearch(searchQuery);
                  }
                }}
                leftIcon={<Search className="w-5 h-5" />}
                className="pr-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => void performSearch(searchQuery)}
            >
              AI 검색
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon={<Package className="w-16 h-16 text-red-400" />}
            title="오류가 발생했습니다"
            description={error}
            action={
              <Button variant="primary" onClick={() => fetchAllItems()}>
                다시 시도
              </Button>
            }
          />
        ) : sortedItems.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-400" />}
            title={isSearchMode ? "검색 결과가 없습니다" : "등록된 분실물이 없습니다"}
            description={
              isSearchMode 
                ? "다른 검색어로 시도해보세요"
                : "첫 번째 분실물을 등록해보세요!"
            }
            action={
              !isSearchMode && (
                <Button 
                  variant="primary"
                  onClick={() => navigate('/lost-items/create')}
                >
                  분실물 등록하기
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* 아이템 그리드/리스트 */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {sortedItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`hover-lift cursor-pointer group ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}
                  onClick={() => navigate(`/lost-items/${item.id}`)}
                >
                  {viewMode === 'grid' ? (
                    // 그리드 뷰
                    <>
                      <div className="aspect-w-16 aspect-h-9 mb-4">
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.itemName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.itemName}
                          </h3>
                          <Badge variant="info" size="sm">
                            {ItemCategoryLabels[item.category]}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {item.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatRelativeTime(item.foundDate)}
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    // 리스트 뷰
                    <>
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.itemName}
                          </h3>
                          <Badge variant="info" size="sm">
                            {ItemCategoryLabels[item.category]}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatRelativeTime(item.foundDate)}
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            {!isSearchMode && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => fetchAllItems(currentPage - 1)}
                  >
                    이전
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i;
                      return (
                        <button
                          key={page}
                          onClick={() => fetchAllItems(page)}
                          className={`px-3 py-1 text-sm rounded ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => fetchAllItems(currentPage + 1)}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 필터 모달 */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="필터 옵션"
        size="md"
      >
        <div className="space-y-6">
          {/* 카테고리 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ItemCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 카테고리</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 장소 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              장소
            </label>
            <Input
              type="text"
              placeholder="예: 강남역, 홍대입구역"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          {/* 날짜 범위 필터 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 날짜
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 날짜
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={clearFilters}>
              초기화
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                applyFilters();
                setShowFilters(false);
              }}
            >
              필터 적용
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LostItemListPage;