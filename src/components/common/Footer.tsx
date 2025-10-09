import { Link } from 'react-router-dom';
import { 
  Search
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* 로고 및 간단한 소개 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI 분실물 찾기</h3>
              <p className="text-xs text-gray-400">AI 기반 매칭 서비스</p>
            </div>
          </div>

          {/* 서비스 빠른 링크 */}
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/lost-items" className="text-gray-300 hover:text-white transition-colors">
              분실물 검색
            </Link>
            <Link to="/lost-items/create" className="text-gray-300 hover:text-white transition-colors">
              습득물 등록
            </Link>
            <Link to="/mypage" className="text-gray-300 hover:text-white transition-colors">
              내 보관함
            </Link>
          </div>

          {/* 저작권 */}
          <div className="text-sm text-gray-400">
            © {currentYear} AI 분실물 찾기. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
