import { Link } from 'react-router-dom';
import { 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  ExternalLink
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 소개 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AI 분실물 찾기</h3>
                <p className="text-sm text-gray-400">AI 기반 매칭 서비스</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              자연어 검색과 AI 기술을 활용하여 잃어버린 물건을 빠르고 정확하게 찾아드립니다. 
              안전하고 신뢰할 수 있는 매칭 서비스를 제공합니다.
            </p>
            
            {/* 연락처 정보 */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@lostfound.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>1588-1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>서울특별시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>

          {/* 서비스 메뉴 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/lost-items" className="text-gray-300 hover:text-white transition-colors">
                  분실물 검색
                </Link>
              </li>
              <li>
                <Link to="/lost-items/create" className="text-gray-300 hover:text-white transition-colors">
                  습득물 등록
                </Link>
              </li>
              <li>
                <Link to="/mypage" className="text-gray-300 hover:text-white transition-colors">
                  내 보관함
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="text-gray-300 hover:text-white transition-colors">
                  알림
                </Link>
              </li>
            </ul>
          </div>

          {/* 정책 및 지원 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">정책 및 지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  개인정보 처리방침
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  이용약관
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  FAQ
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  고객지원
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4 md:mb-0">
              <span>© {currentYear} AI 분실물 찾기. All rights reserved.</span>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>안전한 서비스</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>대표: 홍길동</span>
              <span>사업자등록번호: 123-45-67890</span>
              <span>통신판매업신고: 2024-서울강남-1234</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
