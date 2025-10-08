import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Tag, Trash2 } from 'lucide-react';
import { ItemCategoryLabels, type LostItem } from '../../types';
import { lostItemApi } from '../../apis/lostItem';
import { useAuth } from '../../contexts/AuthContext';

const LostItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!item || !confirm('정말 이 분실물을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    
    try {
      await lostItemApi.deleteLostItem(item.id);
      alert('분실물이 삭제되었습니다.');
      navigate('/lost-items');
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
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
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/lost-items" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              목록으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8">
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

          <div className="p-8">
            {/* 제목 */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.itemName}</h1>

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

            {/* 액션 버튼 */}
            {isAuthenticated && (
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? '삭제 중...' : '삭제하기'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LostItemDetailPage;
