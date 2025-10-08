import Button from '../components/common/Button';
import { User, Package, Clock, CheckCircle } from 'lucide-react';

const MyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">내가 등록한 분실물과 관련 정보를 확인할 수 있습니다.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 내 정보 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">사용자 정보</h3>
                <p className="text-sm text-gray-600">로그인이 필요합니다</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              로그인하기
            </Button>
          </div>

          {/* 내가 등록한 분실물 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">내가 등록한 분실물</h3>
                <p className="text-sm text-gray-600">0개</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              등록하기
            </Button>
          </div>

          {/* 내가 찾은 분실물 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">내가 찾은 분실물</h3>
                <p className="text-sm text-gray-600">0개</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              검색하기
            </Button>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">최근 활동</h3>
                <p className="text-sm text-gray-600">활동 내역이 없습니다</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              전체 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
