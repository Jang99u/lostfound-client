import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Download,
  Share2
} from 'lucide-react';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../apis/user';
import { lostItemApi } from '../apis/lostItem';
import type { LostItem, MyPageData } from '../types';
import { formatRelativeTime, formatNumber } from '../utils/cn';

type TabType = 'all' | 'registered' | 'matched' | 'completed';
type ViewMode = 'grid' | 'list';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myPageData, setMyPageData] = useState<MyPageData | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // 통계 데이터
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalMatched: 0,
    totalCompleted: 0,
    successRate: 0
  });

  // 마이페이지 데이터 가져오기
  useEffect(() => {
    const fetchMyPageData = async () => {
      if (!isAuthenticated) {
        navigate('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const data = await userApi.getMyPage();
        setMyPageData(data);
        
        // 통계 계산
        const totalRegistered = data.lostItems.length;
        const totalMatched = data.lostItems.filter(item => item.status === 'matched').length;
        const totalCompleted = data.lostItems.filter(item => item.status === 'completed').length;
        const successRate = totalRegistered > 0 ? Math.round((totalCompleted / totalRegistered) * 100) : 0;
        
        setStats({
          totalRegistered,
          totalMatched,
          totalCompleted,
          successRate
        });
      } catch (err: any) {
        console.error('Failed to fetch mypage data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [isAuthenticated, navigate]);

  // 탭별 필터링된 아이템
  const getFilteredItems = () => {
    if (!myPageData) return [];
    
    switch (activeTab) {
      case 'registered':
        return myPageData.lostItems.filter(item => item.status === 'registered');
      case 'matched':
        return myPageData.lostItems.filter(item => item.status === 'matched');
      case 'completed':
        return myPageData.lostItems.filter(item => item.status === 'completed');
      default:
        return myPageData.lostItems;
    }
  };

  // 아이템 삭제
  const handleDeleteItem = async (itemId: number) => {
    try {
      await lostItemApi.deleteLostItem(itemId);
      setMyPageData(prev => prev ? {
        ...prev,
        lostItems: prev.lostItems.filter(item => item.id !== itemId)
      } : null);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  // 아이템 선택 토글
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    const filteredItems = getFilteredItems();
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <Badge variant="info" size="sm">등록됨</Badge>;
      case 'matched':
        return <Badge variant="warning" size="sm">매칭중</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">회수완료</Badge>;
      default:
        return <Badge variant="default" size="sm">알 수 없음</Badge>;
    }
  };

  const filteredItems = getFilteredItems();

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<Users className="w-16 h-16 text-gray-400" />}
        title="로그인이 필요합니다"
        description="내 보관함을 보려면 먼저 로그인해주세요."
        action={
          <Button 
            variant="primary"
            onClick={() => navigate('/auth/login')}
          >
            로그인하기
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                내 보관함
              </h1>
              <p className="text-gray-600 mt-1">
                등록한 분실물과 관련 활동을 관리하세요
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/lost-items/create')}
              >
                새로 등록
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                leftIcon={<Settings className="w-4 h-4" />}
              >
                설정
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalRegistered)}
            </div>
            <div className="text-sm text-gray-600">등록한 분실물</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalMatched)}
            </div>
            <div className="text-sm text-gray-600">매칭 진행중</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalCompleted)}
            </div>
            <div className="text-sm text-gray-600">회수 완료</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Bell className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.successRate}%
            </div>
            <div className="text-sm text-gray-600">성공률</div>
          </Card>
        </div>
      </div>

      {/* 탭 및 필터 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* 탭 */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: '전체', count: stats.totalRegistered },
                { key: 'registered', label: '등록됨', count: stats.totalRegistered - stats.totalMatched - stats.totalCompleted },
                { key: 'matched', label: '매칭중', count: stats.totalMatched },
                { key: 'completed', label: '완료', count: stats.totalCompleted }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <Badge variant="outline" size="sm" className="ml-2">
                    {tab.count}
                  </Badge>
                </button>
              ))}
            </div>

            {/* 뷰 모드 및 액션 */}
            <div className="flex items-center space-x-3">
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

              {/* 선택된 아이템 액션 */}
              {selectedItems.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedItems.size}개 선택됨
                  </span>
                  <Button variant="outline" size="sm">
                    일괄 삭제
                  </Button>
                </div>
              )}
            </div>
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
            icon={<AlertCircle className="w-16 h-16 text-red-400" />}
            title="오류가 발생했습니다"
            description={error}
            action={
              <Button variant="primary" onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            }
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-400" />}
            title={activeTab === 'all' ? "등록된 분실물이 없습니다" : "해당 상태의 분실물이 없습니다"}
            description={
              activeTab === 'all' 
                ? "첫 번째 분실물을 등록해보세요!"
                : "다른 탭을 확인해보세요."
            }
            action={
              activeTab === 'all' && (
                <Button 
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => navigate('/lost-items/create')}
                >
                  분실물 등록하기
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* 전체 선택 체크박스 */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                  onChange={toggleAllSelection}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  전체 선택 ({selectedItems.size}/{filteredItems.length})
                </span>
              </label>
            </div>

            {/* 아이템 그리드/리스트 */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className={`hover-lift cursor-pointer group ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  } ${selectedItems.has(item.id) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => navigate(`/lost-items/${item.id}`)}
                >
                  {viewMode === 'grid' ? (
                    // 그리드 뷰
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleItemSelection(item.id);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(item.status)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(item.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

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
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {item.itemName}
                        </h3>
                        
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
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.id);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
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
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(item.status)}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToDelete(item.id);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
          </>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        title="분실물 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            이 분실물을 삭제하시겠습니까? 삭제된 분실물은 복구할 수 없습니다.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }}
            >
              취소
            </Button>
            <Button 
              variant="error" 
              onClick={() => itemToDelete && handleDeleteItem(itemToDelete)}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyPage;