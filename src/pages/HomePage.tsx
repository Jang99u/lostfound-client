import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  User, 
  MapPin, 
  Calendar, 
  Package, 
  TrendingUp, 
  Shield, 
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Star
} from 'lucide-react';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { lostItemApi } from '../apis/lostItem';
import { ItemCategoryLabels } from '../types';
import type { ItemCategory } from '../types';
import { formatRelativeTime, formatNumber } from '../utils/cn';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    matchedItems: 0,
    newItemsToday: 0,
    successRate: 0
  });

  // 최근 등록된 분실물 가져오기
  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const result = await lostItemApi.getAllLostItems({ page: 0, size: 6 });
        setRecentItems(result.items || []);
        
        // 통계 데이터 설정 (실제로는 별도 API 호출 필요)
        setStats({
          totalItems: result.totalCount || 0,
          matchedItems: Math.floor((result.totalCount || 0) * 0.15),
          newItemsToday: Math.floor((result.totalCount || 0) * 0.02),
          successRate: 85
        });
      } catch (error) {
        console.error('Failed to fetch recent items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    navigate('/lost-items', { 
      state: { 
        searchQuery, 
        category: selectedCategory, 
        location: selectedLocation 
      } 
    });
  };

  // 카테고리 옵션
  const categoryOptions = Object.entries(ItemCategoryLabels).map(([key, label]) => ({
    value: key,
    label
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 헤더 */}
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* 메인 타이틀 */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                AI 기반 <span className="text-blue-600">분실물 찾기</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                자연어 검색과 AI 매칭으로 잃어버린 물건을 빠르게 찾아보세요
              </p>
            </div>

            {/* 통합 검색 섹션 */}
            <Card variant="elevated" padding="lg" className="mb-12">
              <form onSubmit={handleSearch} className="space-y-6">
                {/* 자연어 검색 */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="예: 지하철에서 발견한 검은 지갑, 강남역에서 잃어버린 아이폰"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                    className="text-lg py-4 pr-32"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="absolute right-2 top-2"
                    leftIcon={<Sparkles className="w-5 h-5" />}
                  >
                    AI 검색
                  </Button>
                </div>

                {/* 필터 옵션 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as ItemCategory)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">전체 카테고리</option>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      장소
                    </label>
                    <Input
                      type="text"
                      placeholder="예: 강남역, 홍대입구역"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      발견일
                    </label>
                    <Input
                      type="date"
                      leftIcon={<Calendar className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* 빠른 액션 버튼들 */}
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    습득물 등록
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    내 보관함
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    안전한 매칭
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalItems)}
            </div>
            <div className="text-sm text-gray-600">등록된 분실물</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.matchedItems)}
            </div>
            <div className="text-sm text-gray-600">매칭 완료</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              +{formatNumber(stats.newItemsToday)}
            </div>
            <div className="text-sm text-gray-600">오늘 신규 등록</div>
          </Card>
          
          <Card variant="filled" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.successRate}%
            </div>
            <div className="text-sm text-gray-600">매칭 성공률</div>
          </Card>
        </div>
      </div>

      {/* 최근 등록된 분실물 */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              최근 등록된 분실물
            </h2>
            <p className="text-gray-600">
              방금 전에 등록된 분실물들을 확인해보세요
            </p>
          </div>
          <Button 
            variant="outline" 
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/lost-items')}
          >
            전체 보기
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <Card 
                key={item.id} 
                className="hover-lift cursor-pointer group"
                onClick={() => navigate(`/lost-items/${item.id}`)}
              >
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
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.itemName}
                    </h3>
                    <Badge variant="info" size="sm">
                      {item.category ? ItemCategoryLabels[item.category as ItemCategory] : '기타'}
                    </Badge>
                  </div>
                  
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
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-16 h-16 text-gray-400" />}
            title="등록된 분실물이 없습니다"
            description="아직 등록된 분실물이 없습니다. 첫 번째 분실물을 등록해보세요!"
            action={
              <Button 
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/lost-items/create')}
              >
                분실물 등록하기
              </Button>
            }
          />
        )}
      </div>

      {/* 주요 서비스 */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              주요 서비스
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI 기술과 안전한 매칭 시스템으로 분실물을 찾는 새로운 경험을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center group hover-lift">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI 자연어 검색
              </h3>
              <p className="text-gray-600 mb-6">
                "지하철에서 발견한 검은 지갑"과 같이 자연스러운 문장으로 검색하세요
              </p>
              <Button variant="outline" size="sm">
                검색해보기
              </Button>
            </Card>

            <Card variant="elevated" className="text-center group hover-lift">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                간편한 등록
              </h3>
              <p className="text-gray-600 mb-6">
                사진만 찍으면 AI가 자동으로 정보를 추출하고 등록해드립니다
              </p>
              <Button variant="outline" size="sm">
                등록하기
              </Button>
            </Card>

            <Card variant="elevated" className="text-center group hover-lift">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                안전한 매칭
              </h3>
              <p className="text-gray-600 mb-6">
                인증된 사용자 간의 안전한 매칭과 개인정보 보호를 보장합니다
              </p>
              <Button variant="outline" size="sm">
                자세히 보기
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            잃어버린 물건을 찾고 계신가요?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            AI 기반 검색으로 빠르고 정확하게 분실물을 찾아보세요. 
            지금 바로 검색을 시작하거나 습득물을 등록해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/lost-items')}
              leftIcon={<Search className="w-5 h-5" />}
            >
              분실물 검색하기
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50"
              onClick={() => navigate('/lost-items/create')}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              습득물 등록하기
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;