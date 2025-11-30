import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  User, 
  MapPin, 
  Calendar, 
  Package, 
  TrendingUp, 
  Shield, 
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TmapSelector from '../components/common/TmapSelector';
import { lostItemApi } from '../apis/lostItem';
import { custodyLocationApi } from '../apis/custodyLocation';
import { ItemCategoryLabels } from '../types';
import type { ItemCategory } from '../types';
import type { CustodyLocation } from '../apis/custodyLocation';
import { formatRelativeTime, formatNumber } from '../utils/cn';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFoundDate, setSelectedFoundDate] = useState('');
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    matchedItems: 0,
    newItemsToday: 0,
    successRate: 0
  });
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchPlaceName, setSearchPlaceName] = useState<string>(''); // 장소명 검색
  const [topK, setTopK] = useState(5); // 기본값 5개
  const [nearbyLocations, setNearbyLocations] = useState<CustodyLocation[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchTrigger, setSearchTrigger] = useState(0); // 검색 트리거 (버튼 클릭 시 증가)
  const lastSearchedPointRef = useRef<{ lat: number; lon: number } | null>(null); // 마지막 검색한 좌표 추적

  // 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const newLocation = { lat, lon };
          setCurrentLocation(newLocation);
          // selectedPoint가 없을 때만 설정 (이미 사용자가 선택한 위치가 있으면 유지)
          setSelectedPoint(prev => prev || newLocation);
          setLocationError(null);
        },
        (error) => {
          console.error('위치 정보 가져오기 실패:', error);
          setLocationError('현재 위치를 가져올 수 없습니다. 지도를 클릭하여 위치를 선택해주세요.');
        }
      );
    } else {
      setLocationError('브라우저가 위치 정보를 지원하지 않습니다.');
    }
  }, []);

  // 가까운 보관소 검색 (현재 위치, 지도 선택 위치, 또는 장소명 기반)
  useEffect(() => {
    console.log('[DEBUG] useEffect 실행:', {
      selectedPoint,
      currentLocation,
      searchPlaceName,
      topK,
      searchTrigger,
      loadingNearby
    });

    const fetchNearbyLocations = async () => {
      // 이미 검색 중이면 새로운 검색 방지
      if (loadingNearby) {
        console.log('[DEBUG] 이미 검색 중입니다. 중복 호출을 방지합니다.');
        return;
      }

      // 장소명 검색이 있고 검색 트리거가 발생했으면 장소명 기반 검색
      if (searchPlaceName.trim() && searchTrigger > 0) {
        setLoadingNearby(true);
        setSearchError(null);
        try {
          console.log('장소명 검색 시작:', searchPlaceName.trim());
          const result = await custodyLocationApi.findNearbyCustodyLocationsByPlaceName(
            searchPlaceName.trim(),
            topK
          );
          const locations = result.locations;
          const quotaExceeded = result.quotaExceeded;
          
          console.log('장소명 검색 완료:', locations);
          console.log('검색 결과 개수:', locations?.length || 0);
          console.log('쿼터 초과 여부:', quotaExceeded);
          
          setNearbyLocations(locations || []);
          
          // 쿼터 초과 시 명확한 에러 메시지 표시
          if (quotaExceeded) {
            const errorMsg = `⚠️ TMap API 일일 호출 한도를 초과했습니다.\n\n현재 표시된 보관소는 쿼터 초과 전에 계산된 결과입니다.\n정확한 도보 거리는 내일 다시 시도해주세요.`;
            setSearchError(errorMsg);
            console.warn('TMap API 쿼터 초과:', errorMsg);
          }
          
          // 장소명 검색 성공 시 지도 위치도 업데이트 (첫 번째 결과의 좌표 사용)
          if (locations && locations.length > 0) {
            setSelectedPoint({
              lat: locations[0].latitude,
              lon: locations[0].longitude
            });
            if (!quotaExceeded) {
              setSearchError(null);
            }
          } else {
            // 빈 결과가 나올 수 있는 경우:
            // 1. 장소를 찾을 수 없음
            // 2. 해당 위치 주변에 보관소가 없음
            const errorMsg = `장소 '${searchPlaceName}'를 찾을 수 없거나, 주변에 보관소가 없습니다.\n\n가능한 원인:\n- 장소명이 정확하지 않을 수 있습니다 (예: "강남역" → "서울 강남역")\n- 해당 위치 주변 10km 내에 보관소가 없음\n\n다른 장소명을 시도해보세요. (예: 서울시청, 홍대입구역)`;
            console.warn('장소 검색 결과 없음:', errorMsg);
            setSearchError(errorMsg);
          }
        } catch (error: any) {
          console.error('Failed to fetch nearby locations by place name:', error);
          console.error('에러 상세:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText
          });
          
          setNearbyLocations([]);
          
          // 서버 에러 메시지가 있으면 사용, 없으면 기본 메시지
          let errorMessage = `장소 '${searchPlaceName}'를 찾을 수 없거나 검색 중 오류가 발생했습니다.`;
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          } else if (error.response?.status === 404) {
            errorMessage = `장소 '${searchPlaceName}'를 찾을 수 없습니다.`;
          } else if (error.response?.status === 429) {
            errorMessage = 'TMap API 일일 호출 한도를 초과했습니다. 내일 다시 시도해주세요.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setSearchError(errorMessage);
        } finally {
          setLoadingNearby(false);
        }
        return;
      }

      // 장소명 검색이 없거나 트리거가 없으면 좌표 기반 검색 (자동 실행)
      if (searchPlaceName.trim() && searchTrigger === 0) {
        // 장소명이 입력되어 있지만 아직 검색 버튼을 누르지 않았으면 검색하지 않음
        return;
      }

      // 장소명이 없으면 좌표 기반 검색
      const searchPoint = selectedPoint || currentLocation;
      if (!searchPoint) {
        // 좌표가 없으면 로딩 상태를 false로 설정
        setLoadingNearby(false);
        return;
      }

      // 이전에 검색한 좌표와 동일하면 중복 호출 방지
      if (lastSearchedPointRef.current &&
          Math.abs(lastSearchedPointRef.current.lat - searchPoint.lat) < 0.0001 &&
          Math.abs(lastSearchedPointRef.current.lon - searchPoint.lon) < 0.0001) {
        console.log('[DEBUG] 동일한 좌표에 대한 중복 검색을 방지합니다:', {
          last: lastSearchedPointRef.current,
          current: searchPoint
        });
        return;
      }

      console.log('[DEBUG] 새로운 검색 시작:', {
        lastSearched: lastSearchedPointRef.current,
        newPoint: searchPoint
      });

      // 검색할 좌표 저장
      lastSearchedPointRef.current = { lat: searchPoint.lat, lon: searchPoint.lon };

      setLoadingNearby(true);
      setSearchError(null);
      try {
        console.log('보관소 검색 시작:', { lat: searchPoint.lat, lon: searchPoint.lon, topK });
        const result = await custodyLocationApi.findNearbyCustodyLocations({
          latitude: searchPoint.lat,
          longitude: searchPoint.lon,
          topK: topK
        });
        const locations = result.locations;
        const quotaExceeded = result.quotaExceeded;
        
        console.log('보관소 검색 완료:', locations);
        console.log('쿼터 초과 여부:', quotaExceeded);
        
        setNearbyLocations(locations || []);
        
        // 쿼터 초과 시 명확한 에러 메시지 표시
        if (quotaExceeded) {
          const errorMsg = `⚠️ TMap API 일일 호출 한도를 초과했습니다.\n\n현재 표시된 보관소는 쿼터 초과 전에 계산된 결과입니다.\n정확한 도보 거리는 내일 다시 시도해주세요.`;
          setSearchError(errorMsg);
          console.warn('TMap API 쿼터 초과:', errorMsg);
        } else if (!locations || locations.length === 0) {
          setSearchError('10km 반경 내 보관소를 찾을 수 없습니다.');
        }
      } catch (error: any) {
        console.error('Failed to fetch nearby locations:', error);
        setNearbyLocations([]);
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          setSearchError('요청 시간이 초과되었습니다. 서버에서 TMap API 호출이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setSearchError(
            error.response?.data?.message || 
            error.message || 
            '보관소 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          );
        }
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchNearbyLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPoint, currentLocation, searchPlaceName, topK, searchTrigger]); // loadingNearby는 의존성에서 제외 (무한 루프 방지)

  // 최근 등록된 분실물 및 통계 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 최근 아이템과 통계를 병렬로 가져오기
        const [itemsResult, statisticsResult] = await Promise.all([
          lostItemApi.getAllLostItems({ page: 0, size: 6 }),
          lostItemApi.getStatistics()
        ]);
        
        setRecentItems(itemsResult.items || []);
        
        // 통계 데이터 설정 (서버에서 계산된 정확한 값 사용)
        setStats({
          totalItems: statisticsResult.totalItems,
          matchedItems: statisticsResult.matchedItems,
          newItemsToday: statisticsResult.newItemsToday,
          successRate: 0 // 사용하지 않음
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 검색어가 있으면 AI 검색, 없으면 필터만 적용
    navigate('/lost-items', { 
      state: { 
        searchQuery: searchQuery.trim() || undefined, 
        category: selectedCategory || undefined, 
        location: selectedLocation.trim() || undefined,
        brand: selectedBrand.trim() || undefined,
        foundDate: selectedFoundDate || undefined
      } 
    });
  };

  // 카테고리 옵션
  const categoryOptions = Object.entries(ItemCategoryLabels).map(([key, label]) => ({
    value: key,
    label
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* 메인 타이틀 */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                AI 기반 <span className="text-blue-600">분실물 찾기</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                자연어 검색과 AI 매칭으로 잃어버린 물건을 빠르게 찾아보세요
              </p>
            </div>

            {/* 통합 검색 섹션 */}
            <Card variant="elevated" padding="lg" className="mb-12">
              <form onSubmit={handleSearch} className="space-y-6">
                {/* 자연어 검색 */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="예: 지하철에서 발견한 검은 지갑, 강남역에서 잃어버린 아이폰"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="text-lg py-4 pr-32"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="absolute right-2 top-2"
                    leftIcon={<Sparkles className="w-5 h-5" />}
                  >
                    AI 검색
                  </Button>
                </div>

                {/* 필터 옵션 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as ItemCategory)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">전체 카테고리</option>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드
                    </label>
                    <Input
                      type="text"
                      placeholder="예: 나이키, 구찌"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      leftIcon={<Package className="w-4 h-4" />}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      습득일 이후
                    </label>
                    <Input
                      type="date"
                      value={selectedFoundDate}
                      onChange={(e) => setSelectedFoundDate(e.target.value)}
                      leftIcon={<Calendar className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* 빠른 액션 버튼들 */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/lost-items/create')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    습득물 등록
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/mypage')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    내 보관함
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* 가까운 보관소 섹션 */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              내 주변 보관소 찾기
            </h2>
            <p className="text-gray-600">
              현재 위치 기준 10km 반경 내 보관소 중 도보 거리가 가까운 순으로 최대 5개를 보여줍니다.
              {locationError && (
                <span className="block mt-2 text-sm text-orange-600">{locationError}</span>
              )}
            </p>
          </div>

          <Card variant="filled" className="mb-6 p-4 space-y-4">
            {/* 장소명 검색 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                장소명으로 검색
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="예: 강남역, 홍대입구역, 서울시청"
                  value={searchPlaceName}
                  onChange={(e) => setSearchPlaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchPlaceName.trim()) {
                      e.preventDefault();
                      setSearchTrigger(prev => prev + 1);
                    }
                  }}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (searchPlaceName.trim()) {
                      // 검색 트리거 증가하여 useEffect에서 검색 실행
                      setSearchTrigger(prev => prev + 1);
                    }
                  }}
                  disabled={!searchPlaceName.trim() || loadingNearby}
                >
                  {loadingNearby ? '검색 중...' : '검색'}
                </Button>
                {searchPlaceName && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchPlaceName('');
                      setSelectedPoint(null);
                      setSearchTrigger(0);
                      setNearbyLocations([]);
                      setSearchError(null);
                    }}
                    disabled={loadingNearby}
                  >
                    초기화
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                장소명을 입력하면 해당 장소 기준 10km 반경 내 보관소를 검색합니다.
              </p>
            </div>

            <div className="text-center text-sm text-gray-500 mb-2">또는</div>

            <TmapSelector
              latitude={selectedPoint?.lat || currentLocation?.lat}
              longitude={selectedPoint?.lon || currentLocation?.lon}
              onLocationSelect={(lat, lon) => {
                setSelectedPoint({ lat, lon });
                setSearchPlaceName(''); // 지도 클릭 시 장소명 초기화
              }}
              height="400px"
              nearbyLocations={nearbyLocations}
            />

            {(selectedPoint || currentLocation) && !searchPlaceName && (
              <div className="text-sm text-gray-600">
                {selectedPoint ? (
                  <>
                    검색 위치: 위도 {selectedPoint.lat.toFixed(6)}, 경도 {selectedPoint.lon.toFixed(6)}
                    {currentLocation && (
                      <span className="ml-2 text-gray-500">
                        (현재 위치: {currentLocation.lat.toFixed(6)}, {currentLocation.lon.toFixed(6)})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    현재 위치: 위도 {currentLocation!.lat.toFixed(6)}, 경도 {currentLocation!.lon.toFixed(6)}
                  </>
                )}
              </div>
            )}
            {searchPlaceName && nearbyLocations.length > 0 && (
              <div className="text-sm text-gray-600">
                검색 장소: <span className="font-medium">{searchPlaceName}</span>
                {nearbyLocations.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    (좌표: {nearbyLocations[0].latitude.toFixed(6)}, {nearbyLocations[0].longitude.toFixed(6)})
                  </span>
                )}
              </div>
            )}
          </Card>
        </div>
          
        {searchError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{searchError}</p>
            <p className="mt-2 text-xs text-red-500">
              브라우저 콘솔을 확인하시거나 잠시 후 다시 시도해주세요.
            </p>
          </div>
        )}
        
        {loadingNearby ? (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="mt-3 text-gray-600 font-medium">주변 보관소 거리 계산 중...</span>
            <p className="mt-2 text-xs text-gray-500">
              TMap API 호출로 인해 시간이 걸릴 수 있습니다. (최대 2분)
            </p>
            <p className="mt-1 text-xs text-gray-400">
              서버에서 각 보관소마다 도보 거리를 계산하고 있습니다...
            </p>
          </div>
        ) : nearbyLocations.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              <Shield className="w-4 h-4 inline mr-1" />
              총 {nearbyLocations.length}개의 가까운 보관소를 찾았습니다. (10km 반경 내, 도보 거리 순)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {nearbyLocations.map((location, index) => (
                <Card key={location.id} variant="filled" className="hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" size="sm">
                        {index + 1}위
                      </Badge>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {location.name}
                      </h3>
                    </div>
                    {location.itemCount > 0 && (
                      <Badge variant="info" size="sm">
                        {location.itemCount}개
                      </Badge>
                    )}
                  </div>
                  
                  {location.walkingDistance && location.walkingTime && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">
                          도보 {Math.round(location.walkingTime)}분 ({Math.round(location.walkingDistance / 1000 * 10) / 10}km)
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        위도: {location.latitude.toFixed(6)}, 경도: {location.longitude.toFixed(6)}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        ) : (selectedPoint || currentLocation || searchPlaceName) ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>10km 반경 내 보관소를 찾을 수 없습니다.</p>
            <p className="text-sm mt-2">
              {searchPlaceName ? (
                <>다른 장소명을 입력하거나 지도를 클릭하여 위치를 선택해보세요.</>
              ) : (
                <>다른 위치를 선택해보세요.</>
              )}
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {locationError ? (
              <>
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>{locationError}</p>
                <p className="text-sm mt-2">장소명을 입력하거나 지도를 클릭하여 검색 위치를 선택하세요.</p>
              </>
            ) : (
              <>
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-pulse" />
                <p>위치 정보를 가져오는 중...</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* 통계 섹션 */}
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalItems)}
            </div>
            <div className="text-sm text-gray-600">등록된 분실물</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.matchedItems)}
            </div>
            <div className="text-sm text-gray-600">매칭 완료</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              +{formatNumber(stats.newItemsToday)}
            </div>
            <div className="text-sm text-gray-600">오늘 신규 등록</div>
          </Card>
        </div>
      </div>

      {/* 최근 등록된 분실물 */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              최근 등록된 분실물
            </h2>
            <p className="text-gray-600">
              방금 전에 등록된 분실물들을 확인해보세요
            </p>
          </div>
          <Button 
            variant="outline" 
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/lost-items')}
          >
            전체 보기
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <Card 
                key={item.id} 
                className="hover-lift cursor-pointer group"
                onClick={() => navigate(`/lost-items/${item.id}`)}
              >
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
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.itemName}
                    </h3>
                    <Badge variant="info" size="sm">
                      {item.category ? ItemCategoryLabels[item.category as ItemCategory] : '기타'}
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
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-400" />}
            title="등록된 분실물이 없습니다"
            description="아직 등록된 분실물이 없습니다. 첫 번째 분실물을 등록해보세요!"
            action={
              <Button 
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/lost-items/create')}
              >
                분실물 등록하기
              </Button>
            }
          />
        )}
      </div>

      {/* 주요 서비스 */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              주요 서비스
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI 기술과 안전한 매칭 시스템으로 분실물을 찾는 새로운 경험을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center group hover-lift">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI 자연어 검색
              </h3>
              <p className="text-gray-600 mb-6">
                "지하철에서 발견한 검은 지갑"과 같이 자연스러운 문장으로 검색하세요
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/lost-items')}
              >
                검색해보기
              </Button>
            </Card>

            <Card variant="elevated" className="text-center group hover-lift">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                간편한 등록
              </h3>
              <p className="text-gray-600 mb-6">
                사진과 간단한 정보만 입력하면 빠르게 등록할 수 있습니다
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/lost-items/create')}
              >
                등록하기
              </Button>
            </Card>

            <Card variant="elevated" className="text-center group hover-lift">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                안전한 매칭
              </h3>
              <p className="text-gray-600 mb-6">
                인증된 사용자 간의 안전한 매칭과 개인정보 보호를 보장합니다
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/lost-items')}
              >
                자세히 보기
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            잃어버린 물건을 찾고 계신가요?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            AI 기반 검색으로 빠르고 정확하게 분실물을 찾아보세요. 
            지금 바로 검색을 시작하거나 습득물을 등록해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/lost-items')}
              leftIcon={<Search className="w-5 h-5" />}
            >
              분실물 검색하기
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50"
              onClick={() => navigate('/lost-items/create')}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              습득물 등록하기
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;