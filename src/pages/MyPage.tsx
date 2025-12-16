import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Bell,
  Settings,
  Grid3X3,
  List,
  Users,
  Search
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
import { claimApi } from '../apis/claim';
import { watchKeywordApi } from '../apis/watchKeyword';
import type { MyPageData, ClaimRequest, WatchKeyword } from '../types';
import { formatRelativeTime, formatNumber } from '../utils/cn';

type TabType = 'all' | 'registered' | 'matched' | 'completed' | 'claims' | 'sent-claims' | 'keywords';
type ViewMode = 'grid' | 'list';

const MyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // URL 파라미터에서 탭 읽기
  const tabParam = searchParams.get('tab') as TabType | null;
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [myPageData, setMyPageData] = useState<MyPageData | null>(null);
  const [sentClaimRequests, setSentClaimRequests] = useState<ClaimRequest[]>([]);
  const [watchKeywords, setWatchKeywords] = useState<WatchKeyword[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordError, setKeywordError] = useState('');

  // 통계 데이터
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalMatched: 0,
    totalCompleted: 0
  });

  // 마이페이지 데이터 가져오기
  useEffect(() => {
    const fetchMyPageData = async () => {
      // 인증 로딩 중이면 대기
      if (authLoading) return;
      
      if (!isAuthenticated) {
        navigate('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const [myPageResponse, sentClaimsResponse, keywordsResponse] = await Promise.all([
          userApi.getMyPage(),
          claimApi.getSentClaimRequests(),
          watchKeywordApi.getWatchKeywords().catch(() => []) // 키워드 API 실패해도 계속 진행
        ]);
        
        setMyPageData(myPageResponse);
        setSentClaimRequests(sentClaimsResponse);
        setWatchKeywords(keywordsResponse);
        
        // 통계 계산 (안전하게 처리)
        const lostItems = myPageResponse.lostItems || [];
        const totalRegistered = lostItems.length;
        const totalMatched = lostItems.filter(item => item.status === 'MATCHED').length;
        const totalCompleted = lostItems.filter(item => item.status === 'COMPLETED').length;
        
        setStats({
          totalRegistered,
          totalMatched,
          totalCompleted
        });
      } catch (err: any) {
        console.error('Failed to fetch mypage data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [isAuthenticated, authLoading, navigate]);

  // URL 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    if (tabParam && ['all', 'registered', 'matched', 'completed', 'claims', 'sent-claims', 'keywords'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 탭별 필터링된 아이템
  const getFilteredItems = () => {
    if (!myPageData || !myPageData.lostItems) return [];
    
    const lostItems = myPageData.lostItems;
    switch (activeTab) {
      case 'registered':
        return lostItems.filter(item => item.status === 'REGISTERED');
      case 'matched':
        return lostItems.filter(item => item.status === 'MATCHED');
      case 'completed':
        return lostItems.filter(item => item.status === 'COMPLETED');
      default:
        return lostItems;
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
      // 성공 메시지는 표시하지 않음 (바로 사라짐으로 충분)
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      // 실패 시에만 에러 메시지 표시
      const errorMessage = err.response?.data?.message || '분실물 삭제에 실패했습니다. 다시 시도해주세요.';
      setError(errorMessage);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // 키워드 추가
  const handleAddKeyword = async () => {
    const keyword = newKeyword.trim();
    if (!keyword) {
      setKeywordError('키워드를 입력해주세요.');
      return;
    }

    if (keyword.length < 2) {
      setKeywordError('키워드는 최소 2자 이상이어야 합니다.');
      return;
    }

    if (keyword.length > 50) {
      setKeywordError('키워드는 최대 50자까지 입력 가능합니다.');
      return;
    }

    setProcessing(true);
    setKeywordError('');
    
    try {
      const newWatchKeyword = await watchKeywordApi.createWatchKeyword({ keyword });
      setWatchKeywords(prev => [newWatchKeyword, ...prev]);
      setShowKeywordModal(false);
      setNewKeyword('');
      alert('키워드가 등록되었습니다.');
    } catch (err: any) {
      console.error('Failed to create keyword:', err);
      const errorMessage = err.response?.data?.message || '키워드 등록에 실패했습니다.';
      if (errorMessage.includes('이미') || errorMessage.includes('중복')) {
        setKeywordError('이미 등록된 키워드입니다.');
      } else {
        setKeywordError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  // 회수 요청 승인
  const handleApproveClaimRequest = async (claimId: number) => {
    if (!confirm('이 회수 요청을 승인하시겠습니까?')) return;

    setProcessing(true);
    try {
      await claimApi.approveClaimRequest(claimId);
      // 데이터 새로고침
      const data = await userApi.getMyPage();
      setMyPageData(data);
      alert('회수 요청이 승인되었습니다.');
    } catch (err: any) {
      console.error('Failed to approve claim request:', err);
      alert('승인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setProcessing(false);
    }
  };

  // 회수 요청 거절
  const handleRejectClaimRequest = async (claimId: number) => {
    if (!confirm('이 회수 요청을 거절하시겠습니까?')) return;

    setProcessing(true);
    try {
      await claimApi.rejectClaimRequest(claimId);
      // 데이터 새로고침
      const data = await userApi.getMyPage();
      setMyPageData(data);
      alert('회수 요청이 거절되었습니다.');
    } catch (err: any) {
      console.error('Failed to reject claim request:', err);
      alert('거절에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setProcessing(false);
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
  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'REGISTERED':
        return <Badge variant="info" size="sm">등록됨</Badge>;
      case 'MATCHED':
        return <Badge variant="warning" size="sm">매칭중</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" size="sm">회수완료</Badge>;
      default:
        return <Badge variant="default" size="sm">알 수 없음</Badge>;
    }
  };

  const filteredItems = getFilteredItems();

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
              {formatNumber(myPageData?.pendingClaimCount || 0)}
            </div>
            <div className="text-sm text-gray-600">대기중인 회수 요청</div>
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
                { key: 'completed', label: '완료', count: stats.totalCompleted },
                { key: 'claims', label: '받은 회수 요청', count: myPageData?.receivedClaimRequests?.length || 0 },
                { key: 'sent-claims', label: '보낸 회수 요청', count: sentClaimRequests.length },
                { key: 'keywords', label: '키워드 알림', count: watchKeywords.length }
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
        ) : activeTab === 'claims' ? (
          // 회수 요청 목록
          <div className="space-y-4">
            {myPageData?.receivedClaimRequests && myPageData.receivedClaimRequests.length > 0 ? (
              myPageData.receivedClaimRequests.map((claim) => (
                <Card key={claim.id} variant="elevated">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.lostItemName}
                        </h3>
                        <Badge 
                          variant={
                            claim.status === 'PENDING' ? 'warning' :
                            claim.status === 'APPROVED' ? 'success' :
                            claim.status === 'REJECTED' ? 'error' : 'default'
                          }
                        >
                          {claim.status === 'PENDING' ? '대기중' :
                           claim.status === 'APPROVED' ? '승인됨' :
                           claim.status === 'REJECTED' ? '거절됨' : claim.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>요청자:</strong> {claim.claimerLoginId}
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">요청 메시지:</p>
                        <p className="text-gray-800">{claim.message}</p>
                      </div>

                      {/* 증빙 이미지 표시 */}
                      {claim.imageUrl && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">증빙 이미지:</p>
                          <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={claim.imageUrl}
                              alt="증빙 이미지"
                              className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(claim.imageUrl, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(claim.createdAt)}
                      </div>
                    </div>
                    
                    {claim.status === 'PENDING' && (
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveClaimRequest(claim.id)}
                          disabled={processing}
                          leftIcon={<CheckCircle className="w-4 h-4" />}
                        >
                          승인
                        </Button>
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => handleRejectClaimRequest(claim.id)}
                          disabled={processing}
                          leftIcon={<AlertCircle className="w-4 h-4" />}
                        >
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={<Bell className="w-16 h-16 text-gray-400" />}
                title="받은 회수 요청이 없습니다"
                description="아직 회수 요청이 없습니다."
              />
            )}
          </div>
        ) : activeTab === 'sent-claims' ? (
          // 내가 보낸 회수 요청 목록
          <div className="space-y-4">
            {sentClaimRequests.length > 0 ? (
              sentClaimRequests.map((claim) => (
                <Card key={claim.id} variant="elevated">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {claim.lostItemName}
                        </h3>
                        <Badge 
                          variant={
                            claim.status === 'PENDING' ? 'warning' :
                            claim.status === 'APPROVED' ? 'success' :
                            claim.status === 'REJECTED' ? 'error' : 'default'
                          }
                        >
                          {claim.status === 'PENDING' ? '대기중' :
                           claim.status === 'APPROVED' ? '승인됨' :
                           claim.status === 'REJECTED' ? '거절됨' : claim.status}
                        </Badge>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">내가 보낸 메시지:</p>
                        <p className="text-gray-800">{claim.message}</p>
                      </div>

                      {/* 증빙 이미지 표시 */}
                      {claim.imageUrl && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">첨부한 증빙 이미지:</p>
                          <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={claim.imageUrl}
                              alt="증빙 이미지"
                              className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(claim.imageUrl, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(claim.createdAt)}
                      </div>
                      
                      {claim.status === 'APPROVED' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✅ 회수 요청이 승인되었습니다! 습득자와 연락하여 회수를 진행해주세요.
                          </p>
                        </div>
                      )}
                      
                      {claim.status === 'REJECTED' && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            ❌ 회수 요청이 거절되었습니다.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/lost-items/${claim.lostItemId}`)}
                      >
                        게시글 보기
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={<Bell className="w-16 h-16 text-gray-400" />}
                title="보낸 회수 요청이 없습니다"
                description="아직 회수 요청을 보내지 않았습니다."
              />
            )}
          </div>
        ) : activeTab === 'keywords' ? (
          // 키워드 알림 관리
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">키워드 알림 관리</h2>
                <p className="text-sm text-gray-600">
                  관심 있는 키워드를 등록하면, 해당 키워드와 관련된 분실물이 등록될 때 알림을 받을 수 있습니다.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setNewKeyword('');
                  setKeywordError('');
                  setShowKeywordModal(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                키워드 추가
              </Button>
            </div>

            {watchKeywords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchKeywords.map((keyword) => (
                  <Card key={keyword.id} variant="elevated">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Search className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {keyword.keyword}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant={keyword.isActive ? 'success' : 'default'} size="sm">
                            {keyword.isActive ? '활성' : '비활성'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(keyword.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          이 키워드가 포함된 분실물이 등록되면 알림을 받습니다.
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!confirm(`'${keyword.keyword}' 키워드를 삭제하시겠습니까?`)) return;
                            try {
                              setProcessing(true);
                              await watchKeywordApi.deleteWatchKeyword(keyword.id);
                              setWatchKeywords(prev => prev.filter(k => k.id !== keyword.id));
                            } catch (err: any) {
                              console.error('Failed to delete keyword:', err);
                              alert('키워드 삭제에 실패했습니다.');
                            } finally {
                              setProcessing(false);
                            }
                          }}
                          disabled={processing}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="w-16 h-16 text-gray-400" />}
                title="등록된 키워드가 없습니다"
                description="관심 있는 키워드를 등록하여 관련 분실물 알림을 받아보세요."
                action={
                  <Button
                    variant="primary"
                    onClick={() => {
                      setNewKeyword('');
                      setKeywordError('');
                      setShowKeywordModal(true);
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    키워드 추가하기
                  </Button>
                }
              />
            )}
          </div>
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

      {/* 키워드 추가 모달 */}
      <Modal
        isOpen={showKeywordModal}
        onClose={() => {
          setShowKeywordModal(false);
          setNewKeyword('');
          setKeywordError('');
        }}
        title="키워드 추가"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키워드
            </label>
            <input
              type="text"
              placeholder="예: 구찌 지갑, 아이폰, 검은색 가방"
              value={newKeyword}
              onChange={(e) => {
                setNewKeyword(e.target.value);
                setKeywordError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newKeyword.trim()) {
                  handleAddKeyword();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={processing}
            />
            {keywordError && (
              <p className="mt-1 text-sm text-red-600">{keywordError}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              이 키워드가 포함된 분실물이 등록되면 알림을 받을 수 있습니다.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowKeywordModal(false);
                setNewKeyword('');
                setKeywordError('');
              }}
              disabled={processing}
            >
              취소
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddKeyword}
              loading={processing}
              disabled={!newKeyword.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              추가
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyPage;