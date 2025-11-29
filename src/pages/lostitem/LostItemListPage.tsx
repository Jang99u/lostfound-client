import { useState, useEffect, useCallback, useRef } from 'react';
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

// 카테고리가 유효한지 확인하는 헬퍼 함수
const isValidCategory = (category: ItemCategory | ''): category is ItemCategory => {
  return category !== '' && category !== undefined;
};

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
  const [selectedBrand, setSelectedBrand] = useState('');
  const [foundDateAfter, setFoundDateAfter] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // 필터 모달용 임시 상태
  const [tempCategory, setTempCategory] = useState<ItemCategory | ''>('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempBrand, setTempBrand] = useState('');
  const [tempFoundDateAfter, setTempFoundDateAfter] = useState('');
  
  // 필터 상태를 ref로 저장하여 최신 값 참조
  const filterStateRef = useRef({
    selectedCategory,
    selectedLocation,
    selectedBrand,
    foundDateAfter
  });
  
  // 필터 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    filterStateRef.current = {
      selectedCategory,
      selectedLocation,
      selectedBrand,
      foundDateAfter
    };
  }, [selectedCategory, selectedLocation, selectedBrand, foundDateAfter]);

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

  // 검색 실행 (필터와 함께)
  const performSearch = useCallback(async (
    query: string,
    filters?: {
      category?: ItemCategory | '';
      location?: string;
      brand?: string;
      foundDateAfter?: string;
    }
  ) => {
    const trimmed = query.trim();
    if (!trimmed) {
      await fetchAllItems();
      return;
    }

    setIsSearchMode(true);
    setLoading(true);
    setError('');

    try {
      // 파라미터로 받은 필터 값이 있으면 사용, 없으면 상태 값 사용
      // 빈 문자열을 undefined로 변환
      const categoryValue = filters?.category !== undefined 
        ? (isValidCategory(filters.category) ? filters.category : undefined)
        : (isValidCategory(selectedCategory) ? selectedCategory : undefined);
      const locationValue = filters?.location !== undefined 
        ? (filters.location.trim() || undefined)
        : (selectedLocation.trim() || undefined);
      const brandValue = filters?.brand !== undefined 
        ? (filters.brand.trim() || undefined)
        : (selectedBrand.trim() || undefined);
      const foundDateValue = filters?.foundDateAfter !== undefined 
        ? (filters.foundDateAfter || undefined)
        : (foundDateAfter || undefined);

      // 필터가 있으면 필터와 함께 검색
      const hasFilters = categoryValue || locationValue || brandValue || foundDateValue;
      const searchRequest: any = { 
        query: trimmed, 
        topK: 50 
      };
      
      if (hasFilters) {
        searchRequest.category = categoryValue;
        searchRequest.location = locationValue;
        searchRequest.brand = brandValue;
        searchRequest.foundDateAfter = foundDateValue;
      }
      
      const result = await lostItemApi.searchLostItems(searchRequest);
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
  }, [fetchAllItems, selectedCategory, selectedLocation, selectedBrand, foundDateAfter]);

  // 필터 적용 (여러 필터 동시 적용)
  const applyFilters = useCallback(async (
    page: number = 0,
    filters?: {
      category?: ItemCategory | '';
      location?: string;
      brand?: string;
      foundDateAfter?: string;
    }
  ) => {
    setLoading(true);
    setError('');
    setIsSearchMode(false);

    try {
      // 파라미터로 받은 필터 값이 있으면 사용, 없으면 상태 값 사용
      // filters 파라미터가 있으면 그것을 우선 사용 (상태 업데이트 타이밍 문제 방지)
      let categoryValue: ItemCategory | undefined;
      let locationValue: string | undefined;
      let brandValue: string | undefined;
      let foundDateValue: string | undefined;
      
      if (filters) {
        // filters 파라미터가 있으면 그것을 사용
        categoryValue = filters.category && isValidCategory(filters.category) ? filters.category : undefined;
        locationValue = filters.location?.trim() || undefined;
        brandValue = filters.brand?.trim() || undefined;
        foundDateValue = filters.foundDateAfter || undefined;
      } else {
        // filters 파라미터가 없으면 ref의 최신 상태 값 사용
        const currentState = filterStateRef.current;
        categoryValue = isValidCategory(currentState.selectedCategory) ? currentState.selectedCategory : undefined;
        locationValue = currentState.selectedLocation.trim() || undefined;
        brandValue = currentState.selectedBrand.trim() || undefined;
        foundDateValue = currentState.foundDateAfter || undefined;
      }

      // 필터가 하나라도 있으면 통합 필터링 API 사용
      const hasFilters = categoryValue || locationValue || brandValue || foundDateValue;
      
      let result;
      if (hasFilters) {
        result = await lostItemApi.filterLostItems({
          category: categoryValue,
          location: locationValue,
          brand: brandValue,
          foundDateAfter: foundDateValue,
          page,
          size: 20
        });
      } else {
        result = await lostItemApi.getAllLostItems({ page, size: 20 });
      }

      setItems(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(Math.ceil((result.totalCount || 0) / 20));
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Filter failed:', err);
      setError('필터 적용에 실패했습니다.');
    } finally {
      setLoading(false);
    }
    // filterStateRef를 사용하므로 의존성 배열 비워도 됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 필터 초기화
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedBrand('');
    setFoundDateAfter('');
    // 임시 상태도 초기화
    setTempCategory('');
    setTempLocation('');
    setTempBrand('');
    setTempFoundDateAfter('');
    void fetchAllItems();
  };
  
  // 필터 모달 열 때 현재 필터 상태를 임시 상태로 복사
  const handleOpenFilters = () => {
    setTempCategory(selectedCategory);
    setTempLocation(selectedLocation);
    setTempBrand(selectedBrand);
    setTempFoundDateAfter(foundDateAfter);
    setShowFilters(true);
  };
  
  // 필터 적용 버튼 클릭 시
  const handleApplyFilters = async () => {
    // 상태 업데이트 (UI 반영용)
    setSelectedCategory(tempCategory);
    setSelectedLocation(tempLocation);
    setSelectedBrand(tempBrand);
    setFoundDateAfter(tempFoundDateAfter);
    setShowFilters(false);
    
    // 필터 적용 - 필터 값을 직접 전달하여 상태 업데이트 타이밍 문제 방지
    // applyFilters 내부에서 빈 문자열을 undefined로 변환하므로 그대로 전달
    await applyFilters(0, {
      category: tempCategory,
      location: tempLocation,
      brand: tempBrand,
      foundDateAfter: tempFoundDateAfter
    });
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
    
    // state가 없으면 초기 로드만 수행
    if (!state) {
      void fetchAllItems();
      return;
    }
    
    if (state?.searchQuery) {
      setSearchQuery(state.searchQuery);
      // 검색어와 필터를 함께 전달
      const searchFilters = {
        category: state?.category,
        location: state?.location,
        brand: state?.brand,
        foundDateAfter: state?.foundDate
      };
      
      // performSearch는 내부에서 필터 값을 사용하므로 직접 호출
      setIsSearchMode(true);
      setLoading(true);
      setError('');
      
      const trimmed = state.searchQuery.trim();
      if (trimmed) {
        const categoryValue = isValidCategory(searchFilters.category) ? searchFilters.category : undefined;
        const locationValue = searchFilters.location?.trim() || undefined;
        const brandValue = searchFilters.brand?.trim() || undefined;
        const foundDateValue = searchFilters.foundDateAfter || undefined;
        
        const hasFilters = categoryValue || locationValue || brandValue || foundDateValue;
        const searchRequest: any = { 
          query: trimmed, 
          topK: 50 
        };
        
        if (hasFilters) {
          searchRequest.category = categoryValue;
          searchRequest.location = locationValue;
          searchRequest.brand = brandValue;
          searchRequest.foundDateAfter = foundDateValue;
        }
        
        lostItemApi.searchLostItems(searchRequest)
          .then(result => {
            setItems(result.items || []);
            setTotalCount(result.totalCount || 0);
            setTotalPages(0);
            setCurrentPage(0);
          })
          .catch(err => {
            console.error('Search failed:', err);
            setError('검색에 실패했습니다.');
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      // 필터가 있으면 필터 적용, 없으면 전체 조회
      if (state?.category || state?.location || state?.brand || state?.foundDate) {
        // 상태 업데이트
        if (state?.category) setSelectedCategory(state.category);
        if (state?.location) setSelectedLocation(state.location);
        if (state?.brand) setSelectedBrand(state.brand);
        if (state?.foundDate) {
          setFoundDateAfter(state.foundDate);
        }
        
        // 필터 적용 - state 값을 직접 전달하여 즉시 적용
        const categoryValue = isValidCategory(state?.category) ? state.category : undefined;
        const locationValue = state?.location?.trim() || undefined;
        const brandValue = state?.brand?.trim() || undefined;
        const foundDateValue = state?.foundDate || undefined;
        
        const hasFilters = categoryValue || locationValue || brandValue || foundDateValue;
        
        if (hasFilters) {
          setLoading(true);
          setError('');
          setIsSearchMode(false);
          
          lostItemApi.filterLostItems({
            category: categoryValue,
            location: locationValue,
            brand: brandValue,
            foundDateAfter: foundDateValue,
            page: 0,
            size: 20
          })
            .then(result => {
              setItems(result.items || []);
              setTotalCount(result.totalCount || 0);
              setTotalPages(Math.ceil((result.totalCount || 0) / 20));
              setCurrentPage(0);
            })
            .catch(err => {
              console.error('Filter failed:', err);
              setError('필터 적용에 실패했습니다.');
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          void fetchAllItems();
        }
      } else {
        void fetchAllItems();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // 정렬된 아이템
  const sortedItems = isSearchMode ? items : applySorting(items);

  // 카테고리 옵션
  const categoryOptions = Object.entries(ItemCategoryLabels).map(([key, label]) => ({
    value: key,
    label
  }));

  // 활성 필터 개수
  const activeFiltersCount = [
    isValidCategory(selectedCategory) ? selectedCategory : null,
    selectedLocation.trim(),
    selectedBrand.trim(),
    foundDateAfter
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
                onClick={handleOpenFilters}
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
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                            {item.itemName}
                          </h3>
                          <Badge variant="outline" size="sm" className="flex-shrink-0 font-semibold border-blue-300 text-blue-700 bg-blue-50">
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
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
                            {item.itemName}
                          </h3>
                          <Badge variant="outline" size="sm" className="flex-shrink-0 font-semibold border-blue-300 text-blue-700 bg-blue-50">
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
                    onClick={() => {
                      const hasFilters = isValidCategory(selectedCategory) || selectedLocation.trim() || selectedBrand.trim() || foundDateAfter;
                      if (hasFilters) {
                        void applyFilters(currentPage - 1);
                      } else {
                        void fetchAllItems(currentPage - 1);
                      }
                    }}
                  >
                    이전
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i;
                      return (
                        <button
                          key={page}
                          onClick={() => {
                            const hasFilters = isValidCategory(selectedCategory) || selectedLocation.trim() || selectedBrand.trim() || foundDateAfter;
                            if (hasFilters) {
                              void applyFilters(page);
                            } else {
                              void fetchAllItems(page);
                            }
                          }}
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
                    onClick={() => {
                      const hasFilters = isValidCategory(selectedCategory) || selectedLocation.trim() || selectedBrand.trim() || foundDateAfter;
                      if (hasFilters) {
                        void applyFilters(currentPage + 1);
                      } else {
                        void fetchAllItems(currentPage + 1);
                      }
                    }}
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
        onClose={() => {
          // 모달 닫을 때 임시 상태를 현재 상태로 되돌림
          setTempCategory(selectedCategory);
          setTempLocation(selectedLocation);
          setTempBrand(selectedBrand);
          setTempFoundDateAfter(foundDateAfter);
          setShowFilters(false);
        }}
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
              value={tempCategory}
              onChange={(e) => setTempCategory(e.target.value as ItemCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>

          {/* 브랜드 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              브랜드
            </label>
            <Input
              type="text"
              placeholder="예: 나이키, 애플"
              value={tempBrand}
              onChange={(e) => setTempBrand(e.target.value)}
              leftIcon={<Package className="w-4 h-4" />}
            />
          </div>

          {/* 날짜 필터 (습득일 이후) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              습득일 이후
            </label>
            <Input
              type="date"
              value={tempFoundDateAfter}
              onChange={(e) => setTempFoundDateAfter(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          {/* 액션 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setTempCategory('');
                setTempLocation('');
                setTempBrand('');
                setTempFoundDateAfter('');
              }}
            >
              초기화
            </Button>
            <Button 
              variant="primary" 
              onClick={handleApplyFilters}
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