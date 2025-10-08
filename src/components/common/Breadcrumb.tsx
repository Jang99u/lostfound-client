import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();
  
  // 기본 breadcrumb 생성
  const getDefaultBreadcrumb = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumb: BreadcrumbItem[] = [
      { label: '홈', path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // 세그먼트별 라벨 매핑
      let label = segment;
      switch (segment) {
        case 'lost-items':
          label = '분실물 찾기';
          break;
        case 'create':
          label = '습득물 등록';
          break;
        case 'mypage':
          label = '내 보관함';
          break;
        case 'notifications':
          label = '알림';
          break;
        case 'auth':
          label = '인증';
          break;
        case 'login':
          label = '로그인';
          break;
        default:
          // 숫자인 경우 (ID) "상세보기"로 표시
          if (/^\d+$/.test(segment)) {
            label = '상세보기';
          }
      }

      // 마지막 세그먼트는 링크 없음
      const isLast = index === pathSegments.length - 1;
      breadcrumb.push({
        label,
        path: isLast ? undefined : currentPath
      });
    });

    return breadcrumb;
  };

  const breadcrumbItems = items || getDefaultBreadcrumb();

  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-gray-900 transition-colors flex items-center"
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium flex items-center">
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
