import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Users, 
  Package, 
  Eye,
  EyeOff,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeTime } from '../utils/cn';
import apiClient from '../apis/client';

type NotificationType = 'MATCH' | 'REQUEST' | 'APPROVED' | 'REJECTED' | 'SYSTEM' | 'UPDATE';
type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

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

  // 알림 데이터 로드
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isAuthenticated) {
        navigate('/auth/login');
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/notifications');
        setNotifications(response.data.data || []);
      } catch (err: any) {
        console.error('Failed to load notifications:', err);
        setError('알림을 불러오는데 실패했습니다.');
      } finally {
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
      filtered = filtered.filter(n => n.status === 'UNREAD');
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter.toUpperCase());
    }

    // 아카이브 필터
    if (!showArchived) {
      filtered = filtered.filter(n => n.status !== 'ARCHIVED');
    }

    return filtered;
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.put(`/api/v1/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'READ' as NotificationStatus }
            : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // 알림 아카이브 처리
  const archiveNotification = async (notificationId: number) => {
    try {
      await apiClient.put(`/api/v1/notifications/${notificationId}/archive`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'ARCHIVED' as NotificationStatus }
            : n
        )
      );
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  // 알림 삭제 처리
  const deleteNotification = async (notificationId: number) => {
    try {
      await apiClient.delete(`/api/v1/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // 전체 읽음 처리
  const markAllAsRead = async () => {
    try {
      await apiClient.put('/api/v1/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'READ' as NotificationStatus }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'MATCH':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'REQUEST':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'SYSTEM':
        return <Info className="w-5 h-5 text-purple-600" />;
      case 'UPDATE':
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // 알림 타입별 배지
  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'MATCH':
        return <Badge variant="info" size="sm">매칭</Badge>;
      case 'REQUEST':
        return <Badge variant="success" size="sm">회수요청</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">승인</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">거절</Badge>;
      case 'SYSTEM':
        return <Badge variant="warning" size="sm">시스템</Badge>;
      case 'UPDATE':
        return <Badge variant="outline" size="sm">업데이트</Badge>;
      default:
        return <Badge variant="default" size="sm">알림</Badge>;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

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
                { key: 'request', label: '회수 요청', count: notifications.filter(n => n.type === 'REQUEST').length }
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
                className={`border-l-4 border-l-blue-500 ${
                  notification.status === 'UNREAD' ? 'bg-blue-50' : ''
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
                          notification.status === 'UNREAD' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {getNotificationBadge(notification.type)}
                        {notification.status === 'UNREAD' && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {notification.status === 'UNREAD' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="읽음 처리"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                            title="아카이브"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
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
