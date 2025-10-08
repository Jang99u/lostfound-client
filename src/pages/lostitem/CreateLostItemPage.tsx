import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Package, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { lostItemApi } from '../../apis/lostItem';
import { ItemCategoryLabels } from '../../types';
import type { ItemCategory, CreateLostItemRequest } from '../../types';
import { formatDate } from '../../utils/cn';

type Step = 1 | 2 | 3 | 4;

const CreateLostItemPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 단계 관리
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    image: null as File | null,
    imagePreview: '',
    itemName: '',
    category: '' as ItemCategory | '',
    description: '',
    foundDate: '',
    location: ''
  });
  
  // AI 분석 결과 (시뮬레이션)
  const [aiAnalysis, setAiAnalysis] = useState({
    suggestedName: '',
    suggestedCategory: '' as ItemCategory | '',
    confidence: 0,
    extractedText: ''
  });

  // 단계별 완료 상태
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  // 카테고리 옵션
  const categoryOptions = Object.entries(ItemCategoryLabels).map(([key, label]) => ({
    value: key,
    label
  }));

  // 다음 단계로 이동
  const nextStep = () => {
    if (currentStep < 4) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  // 이전 단계로 이동
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
      
      // AI 분석 시뮬레이션
      simulateAIAnalysis(file);
    }
  };

  // AI 분석 시뮬레이션
  const simulateAIAnalysis = (_file: File) => {
    setLoading(true);
    
    setTimeout(() => {
      setAiAnalysis({
        suggestedName: '검은색 지갑',
        suggestedCategory: 'WALLET_CARD',
        confidence: 85,
        extractedText: '검은색 가죽 지갑, 카드 여러 장 포함'
      });
      setLoading(false);
    }, 2000);
  };

  // AI 제안 적용
  const applyAISuggestion = () => {
    setFormData(prev => ({
      ...prev,
      itemName: aiAnalysis.suggestedName,
      category: aiAnalysis.suggestedCategory
    }));
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!formData.image || !formData.itemName || !formData.category || !formData.location || !formData.foundDate) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData: CreateLostItemRequest = {
        itemName: formData.itemName,
        category: formData.category,
        description: formData.description,
        foundDate: formData.foundDate,
        location: formData.location,
        image: formData.image
      };

      await lostItemApi.createLostItem(requestData);
      navigate('/lost-items', { 
        state: { 
          message: '습득물이 성공적으로 등록되었습니다!' 
        } 
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 단계별 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                습득물 사진 업로드
              </h2>
              <p className="text-gray-600">
                발견한 물건의 사진을 업로드하면 AI가 자동으로 분석해드립니다
              </p>
            </div>

            {/* 이미지 업로드 영역 */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              {formData.imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={formData.imagePreview} 
                      alt="업로드된 이미지"
                      className="max-w-full max-h-64 rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null, imagePreview: '' }));
                        setAiAnalysis({ suggestedName: '', suggestedCategory: '', confidence: 0, extractedText: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {loading && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <LoadingSpinner size="sm" />
                      <span>AI가 이미지를 분석하고 있습니다...</span>
                    </div>
                  )}
                  
                  {aiAnalysis.suggestedName && !loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-blue-900">AI 분석 결과</h3>
                        <Badge variant="info" size="sm">
                          {aiAnalysis.confidence}% 신뢰도
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>추천 이름:</strong> {aiAnalysis.suggestedName}</p>
                        <p><strong>추천 카테고리:</strong> {aiAnalysis.suggestedCategory ? ItemCategoryLabels[aiAnalysis.suggestedCategory] : '분석 중...'}</p>
                        <p><strong>추출된 텍스트:</strong> {aiAnalysis.extractedText}</p>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-3"
                        onClick={applyAISuggestion}
                        leftIcon={<Sparkles className="w-4 h-4" />}
                      >
                        AI 제안 적용하기
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      사진을 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-gray-500 mb-4">
                      JPG, PNG 파일만 업로드 가능합니다 (최대 10MB)
                    </p>
                    <Button
                      variant="primary"
                      leftIcon={<Upload className="w-4 h-4" />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                기본 정보 입력
              </h2>
              <p className="text-gray-600">
                습득물의 기본 정보를 입력해주세요
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="습득물명 *"
                placeholder="예: 검은색 지갑, 아이폰 14"
                value={formData.itemName}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                leftIcon={<Package className="w-4 h-4" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 설명
                </label>
                <textarea
                  placeholder="습득물의 특징, 상태, 포함된 물건 등을 자세히 설명해주세요"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                발견 정보 입력
              </h2>
              <p className="text-gray-600">
                언제, 어디서 발견했는지 알려주세요
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="발견 장소 *"
                placeholder="예: 강남역 2번 출구, 홍대입구역 대합실"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                leftIcon={<MapPin className="w-4 h-4" />}
              />

              <Input
                label="발견 날짜 *"
                type="date"
                value={formData.foundDate}
                onChange={(e) => setFormData(prev => ({ ...prev, foundDate: e.target.value }))}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>

            {/* 추가 안내사항 */}
            <Card variant="filled" className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">등록 시 주의사항</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 정확한 발견 장소와 날짜를 입력해주세요</li>
                    <li>• 개인정보가 포함된 물건은 신중하게 등록해주세요</li>
                    <li>• 등록 후에는 수정이 어려우니 신중하게 입력해주세요</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                등록 정보 확인
              </h2>
              <p className="text-gray-600">
                입력하신 정보를 확인하고 등록을 완료해주세요
              </p>
            </div>

            {/* 등록 정보 미리보기 */}
            <Card variant="elevated" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이미지 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">습득물 사진</h3>
                  {formData.imagePreview ? (
                    <img 
                      src={formData.imagePreview} 
                      alt="습득물"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">등록 정보</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">습득물명:</span>
                        <span className="font-medium">{formData.itemName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">카테고리:</span>
                        <Badge variant="info" size="sm">
                          {formData.category ? ItemCategoryLabels[formData.category] : '미선택'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">발견 장소:</span>
                        <span className="font-medium">{formData.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">발견 날짜:</span>
                        <span className="font-medium">{formData.foundDate ? formatDate(formData.foundDate) : '미입력'}</span>
                      </div>
                      {formData.description && (
                        <div>
                          <span className="text-gray-600">상세 설명:</span>
                          <p className="mt-1 text-gray-800">{formData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">오류</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // 단계 진행률
  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 진행률 바 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">습득물 등록</h1>
            <div className="text-sm text-gray-600">
              {currentStep} / 4 단계
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* 단계 표시 */}
          <div className="flex justify-between mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : step <= completedSteps.size + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                <span className={`text-sm ${
                  step <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {step === 1 ? '사진 업로드' : 
                   step === 2 ? '기본 정보' : 
                   step === 3 ? '발견 정보' : '확인 및 등록'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card variant="elevated" padding="lg">
            {renderStepContent()}
          </Card>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              이전
            </Button>

            <div className="flex space-x-3">
              {currentStep < 4 ? (
                <Button
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !formData.image) ||
                    (currentStep === 2 && (!formData.itemName || !formData.category)) ||
                    (currentStep === 3 && (!formData.location || !formData.foundDate))
                  }
                >
                  다음
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleSubmit}
                  loading={loading}
                  leftIcon={<CheckCircle className="w-5 h-5" />}
                >
                  등록 완료
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLostItemPage;