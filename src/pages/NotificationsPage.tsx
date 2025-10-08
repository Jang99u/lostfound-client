import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Users, 
  Package, 
  Clock,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  RefreshCw
} from 'lucide-react';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/cn';

type NotificationType = 'match' | 'request' | 'system' | 'update';
type NotificationStatus = 'unread' | 'read' | 'archived';

interface Notification {
  id: number;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: string;
  relatedItemId?: number;
  relatedItemName?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 상태 관리
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'match' | 'request' | 'system'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 모의 알림 데이터 (실제로는 API에서 가져옴)
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'match',
      status: 'unread',
      title: 'AI 매칭 성공!',
      message: '등록하신 "검은색 지갑"과 유사한 분실물이 발견되었습니다.',
      timestamp: '2024-01-15T10:30:00Z',
      relatedItemId: 1,
      relatedItemName: '검은색 지갑',
      actionUrl: '/lost-items/1',
      priority: 'high'
    },
    {
      id: 2,
      type: 'request',
      status: 'unread',
      title: '회수 요청',
      message: '홍길동님이 등록하신 "아이폰 14"의 회수를 요청했습니다.',
      timestamp: '2024-01-15T09:15:00Z',
      relatedItemId: 2,
      relatedItemName: '아이폰 14',
      actionUrl: '/lost-items/2',
      priority: 'high'
    },
    {
      id: 3,
      type: 'system',
      status: 'read',
      title: '서비스 업데이트',
      message: 'AI 검색 기능이 개선되었습니다. 더 정확한 검색 결과를 제공합니다.',
      timestamp: '2024-01-14T16:45:00Z',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'update',
      status: 'read',
      title: '매칭 상태 변경',
      message: '등록하신 "노트북 가방"의 매칭 상태가 "완료"로 변경되었습니다.',
      timestamp: '2024-01-14T14:20:00Z',
      relatedItemId: 3,
      relatedItemName: '노트북 가방',
      actionUrl: '/lost-items/3',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'match',
      status: 'read',
      title: '새로운 매칭 후보',
      message: '등록하신 "운동화"와 유사한 분실물이 새로 등록되었습니다.',
      timestamp: '2024-01-13T11:30:00Z',
      relatedItemId: 4,
      relatedItemName: '운동화',
      actionUrl: '/lost-items/4',
      priority: 'low'
    }
  ];

  // 알림 데이터 로드
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) {
        navigate('/auth/login');
        return;
      }

      try {
        setLoading(true);
        // 실제로는 API 호출
        setTimeout(() => {
          setNotifications(mockNotifications);
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        console.error('Failed to load notifications:', err);
        setError('알림을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isAuthenticated, navigate]);

  // 필터링된 알림
  const getFilteredNotifications = () => {
    let filtered = notifications;

    // 상태 필터
    if (filter === 'unread') {
      filtered = filtered.filter(n => n.status === 'unread');
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    // 아카이브 필터
    if (!showArchived) {
      filtered = filtered.filter(n => n.status !== 'archived');
    }

    // 우선순위별 정렬
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // 알림 읽음 처리
  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, status: 'read' as NotificationStatus }
          : n
      )
    );
  };

  // 알림 아카이브 처리
  const archiveNotification = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, status: 'archived' as NotificationStatus }
          : n
      )
    );
  };

  // 알림 삭제 처리
  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // 전체 읽음 처리
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, status: 'read' as NotificationStatus }))
    );
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'request':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'system':
        return <Info className="w-5 h-5 text-purple-600" />;
      case 'update':
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // 알림 타입별 배지
  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return <Badge variant="info" size="sm">매칭</Badge>;
      case 'request':
        return <Badge variant="success" size="sm">요청</Badge>;
      case 'system':
        return <Badge variant="warning" size="sm">시스템</Badge>;
      case 'update':
        return <Badge variant="outline" size="sm">업데이트</Badge>;
      default:
        return <Badge variant="default" size="sm">알림</Badge>;
    }
  };

  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-gray-300';
      default:
        return 'border-l-gray-300';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<Bell className="w-16 h-16 text-gray-400" />}
        title="로그인이 필요합니다"
        description="알림을 보려면 먼저 로그인해주세요."
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
                알림
              </h1>
              <p className="text-gray-600 mt-1">
                매칭, 요청, 시스템 업데이트 등의 알림을 확인하세요
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  전체 읽음
                </Button>
              )}
              
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

      {/* 필터 및 통계 */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 필터 탭 */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: '전체', count: notifications.length },
                { key: 'unread', label: '읽지 않음', count: unreadCount },
                { key: 'match', label: '매칭', count: notifications.filter(n => n.type === 'match').length },
                { key: 'request', label: '요청', count: notifications.filter(n => n.type === 'request').length },
                { key: 'system', label: '시스템', count: notifications.filter(n => n.type === 'system').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
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

            {/* 아카이브 토글 */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>아카이브된 알림 보기</span>
              </label>
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
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-16 h-16 text-gray-400" />}
            title="알림이 없습니다"
            description={
              filter === 'unread' 
                ? "읽지 않은 알림이 없습니다."
                : "해당 조건의 알림이 없습니다."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`border-l-4 ${getPriorityColor(notification.priority)} ${
                  notification.status === 'unread' ? 'bg-blue-50' : ''
                } hover-lift`}
              >
                <div className="flex items-start space-x-4">
                  {/* 아이콘 */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${
                          notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {getNotificationBadge(notification.type)}
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {notification.status === 'unread' && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="읽음 처리"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => archiveNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                            title="아카이브"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowDeleteModal(true);
                              setSelectedNotifications(new Set([notification.id]));
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    {/* 관련 아이템 정보 */}
                    {notification.relatedItemName && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <Package className="w-4 h-4" />
                        <span>관련 아이템: {notification.relatedItemName}</span>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    {notification.actionUrl && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            markAsRead(notification.id);
                            navigate(notification.actionUrl!);
                          }}
                        >
                          자세히 보기
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedNotifications(new Set());
        }}
        title="알림 삭제"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            선택한 알림을 삭제하시겠습니까? 삭제된 알림은 복구할 수 없습니다.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedNotifications(new Set());
              }}
            >
              취소
            </Button>
            <Button 
              variant="error" 
              onClick={() => {
                selectedNotifications.forEach(id => deleteNotification(id));
                setShowDeleteModal(false);
                setSelectedNotifications(new Set());
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
