import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Tag, User, Phone, MessageCircle } from 'lucide-react';
import { ItemCategory, ItemStatus } from '../../types';

const LostItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    message: '',
  });

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const mockItem = {
    id: '1',
    title: '검은색 지갑',
    description: '지하철에서 발견한 검은색 지갑입니다. 안에 신분증과 카드들이 들어있습니다.',
    category: ItemCategory.WALLET,
    location: '강남역 2호선 승강장',
    foundDate: '2024-01-15',
    status: ItemStatus.FOUND,
    imageUrls: [
      'https://via.placeholder.com/400x300',
      'https://via.placeholder.com/400x300',
    ],
    finder: {
      id: '1',
      name: '김습득',
      email: 'finder@example.com',
    },
    createdAt: '2024-01-15T10:30:00Z',
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 연락처 전송 로직 구현
    console.log('Contact info:', contactInfo);
    setShowContactForm(false);
  };

  const getCategoryLabel = (category: ItemCategory) => {
    const labels = {
      [ItemCategory.ELECTRONICS]: '전자제품',
      [ItemCategory.CLOTHING]: '의류',
      [ItemCategory.ACCESSORIES]: '액세서리',
      [ItemCategory.DOCUMENTS]: '서류',
      [ItemCategory.BOOKS]: '도서',
      [ItemCategory.KEYS]: '열쇠',
      [ItemCategory.WALLET]: '지갑',
      [ItemCategory.OTHER]: '기타',
    };
    return labels[category];
  };

  const getStatusLabel = (status: ItemStatus) => {
    const labels = {
      [ItemStatus.FOUND]: '습득됨',
      [ItemStatus.CLAIMED]: '주인 찾음',
      [ItemStatus.RETURNED]: '반환됨',
    };
    return labels[status];
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/lost-items" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-blue-600">분실물 상세</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* 이미지 섹션 */}
          {mockItem.imageUrls && mockItem.imageUrls.length > 0 && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={mockItem.imageUrls[0]}
                alt={mockItem.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* 제목 및 상태 */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{mockItem.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mockItem.status === ItemStatus.FOUND ? 'bg-green-100 text-green-800' :
                    mockItem.status === ItemStatus.CLAIMED ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(mockItem.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* 설명 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">상세 설명</h3>
              <p className="text-gray-700">{mockItem.description}</p>
            </div>

            {/* 정보 섹션 */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">습득 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{getCategoryLabel(mockItem.category)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{mockItem.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{mockItem.foundDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">습득자 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{mockItem.finder.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{mockItem.finder.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            {mockItem.status === ItemStatus.FOUND && (
              <div className="border-t pt-6">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  주인 찾기 신청
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 연락처 폼 모달 */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">주인 찾기 신청</h3>
              <form onSubmit={handleContactSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="010-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    메시지 (선택)
                  </label>
                  <textarea
                    value={contactInfo.message}
                    onChange={(e) => setContactInfo({ ...contactInfo, message: e.target.value })}
                    placeholder="물건에 대한 추가 정보나 확인 방법을 알려주세요"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    신청하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LostItemDetailPage;
