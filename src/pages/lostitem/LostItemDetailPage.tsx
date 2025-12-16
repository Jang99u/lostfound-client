import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  MoreVertical,
  Trash2,
  Send,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { ItemCategoryLabels, type LostItem } from '../../types';
import { lostItemApi } from '../../apis/lostItem';
import { claimApi } from '../../apis/claim';
import { userApi } from '../../apis/user';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const LostItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimImage, setClaimImage] = useState<File | null>(null);
  const [claimImagePreview, setClaimImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated) return;
      
      try {
        const user = await userApi.getMyInfo();
        setCurrentUserId(Number(user.id));
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    fetchCurrentUser();
  }, [isAuthenticated]);

  // 분실물 정보 가져오기
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      setLoading(true);
      setError('');
      
      try {
        const result = await lostItemApi.getLostItemById(Number(id));
        setItem(result);
      } catch (err: any) {
        console.error('Failed to fetch item:', err);
        setError('분실물 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // 작성자 확인
  const isOwner = item && currentUserId && item.userId === currentUserId;

  // 삭제 처리
  const handleDelete = async () => {
    if (!item) return;

    setSubmitting(true);
    
    try {
      await lostItemApi.deleteLostItem(item.id);
      navigate('/lost-items');
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      const errorMessage = err.response?.data?.message || '분실물 삭제에 실패했습니다.';
      setError(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('이미지 크기는 10MB 이하여야 합니다.');
        return;
      }
      
      setClaimImage(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setClaimImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거 핸들러
  const handleImageRemove = () => {
    setClaimImage(null);
    setClaimImagePreview(null);
  };

  // 회수 요청 처리
  const handleClaimRequest = async () => {
    if (!item || !claimMessage.trim()) return;

    setSubmitting(true);
    
    try {
      await claimApi.createClaimRequest(item.id, { 
        message: claimMessage,
        image: claimImage || undefined
      });
      setShowClaimModal(false);
      setClaimMessage('');
      setClaimImage(null);
      setClaimImagePreview(null);
      // 성공 알림
      alert('회수 요청이 전송되었습니다. 습득자의 응답을 기다려주세요.');
      // 상태 업데이트를 위해 페이지 새로고침
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to create claim request:', err);
      const errorMessage = err.response?.data?.message || '회수 요청에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // 상태 배지 렌더링
  const renderStatusBadge = () => {
    if (!item?.status) return null;

    const statusConfig = {
      REGISTERED: { variant: 'info' as const, label: '등록됨' },
      MATCHED: { variant: 'warning' as const, label: '매칭중' },
      COMPLETED: { variant: 'success' as const, label: '회수완료' },
      EXPIRED: { variant: 'default' as const, label: '만료됨' }
    };

    const config = statusConfig[item.status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">분실물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-6">{error || '분실물을 찾을 수 없습니다.'}</p>
          <Link
            to="/lost-items"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/lost-items" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              목록으로
            </Link>

            {/* 더보기 메뉴 (작성자만) */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제하기
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* 이미지 */}
          {item.imageUrl && (
            <div className="w-full h-96">
              <img
                src={item.imageUrl}
                alt={item.itemName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* 제목과 상태 */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{item.itemName}</h1>
              {renderStatusBadge()}
            </div>

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
              <div className="flex items-center text-gray-600">
                <Tag className="w-5 h-5 mr-2" />
                <span>{ItemCategoryLabels[item.category]}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{item.foundDate}</span>
              </div>
            </div>

            {/* 설명 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">상세 설명</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* 회수 요청 버튼 (작성자가 아닌 로그인 사용자만, 상태가 REGISTERED 또는 MATCHED일 때만) */}
            {isAuthenticated && !isOwner && item.status && ['REGISTERED', 'MATCHED'].includes(item.status) && (
              <div className="pt-6 border-t">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowClaimModal(true)}
                  leftIcon={<Send className="w-5 h-5" />}
                  className="w-full sm:w-auto"
                >
                  회수 요청하기
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  이 분실물이 본인의 것이라면 회수를 요청할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="분실물 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말로 이 분실물을 삭제하시겠습니까? 삭제된 분실물은 복구할 수 없습니다.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button 
              variant="error" 
              onClick={handleDelete}
              loading={submitting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* 회수 요청 모달 */}
      <Modal
        isOpen={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setClaimMessage('');
          setClaimImage(null);
          setClaimImagePreview(null);
        }}
        title="회수 요청"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            이 분실물을 회수하려는 이유를 간단히 설명해주세요. 증빙 이미지를 첨부하면 더 신뢰할 수 있습니다.
          </p>
          
          <textarea
            placeholder="예: 제 지갑이 맞습니다. 안에 OO카드와 학생증이 있습니다."
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />

          {/* 이미지 업로드 섹션 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              증빙 이미지 (선택사항)
            </label>
            
            {claimImagePreview ? (
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={claimImagePreview}
                    alt="증빙 이미지 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={submitting}
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  {claimImage?.name}
                </p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">클릭하여 이미지 선택</span> 또는 드래그 앤 드롭
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={submitting}
                />
              </label>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowClaimModal(false);
                setClaimMessage('');
                setClaimImage(null);
                setClaimImagePreview(null);
              }}
              disabled={submitting}
            >
              취소
            </Button>
            <Button 
              variant="primary" 
              onClick={handleClaimRequest}
              loading={submitting}
              disabled={!claimMessage.trim()}
              leftIcon={<Send className="w-4 h-4" />}
            >
              요청 전송
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LostItemDetailPage;
