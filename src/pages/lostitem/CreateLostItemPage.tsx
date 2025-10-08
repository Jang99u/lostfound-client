import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin, Calendar, Tag } from 'lucide-react';
import { ItemCategory } from '../../types';

const CreateLostItemPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ItemCategory.OTHER,
    location: '',
    foundDate: '',
  });
  const [images, setImages] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 분실물 등록 로직 구현
    console.log('Form data:', formData);
    console.log('Images:', images);
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
              <h1 className="text-2xl font-bold text-blue-600">습득물 등록</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold mb-6">습득한 물건을 등록해주세요</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="예: 검은색 지갑"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                상세 설명 *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="습득한 물건에 대한 자세한 설명을 작성해주세요"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Object.values(ItemCategory).map((category) => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* 습득 장소 */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                습득 장소 *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="예: 강남역 2호선 승강장"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 습득 날짜 */}
            <div>
              <label htmlFor="foundDate" className="block text-sm font-medium text-gray-700 mb-2">
                습득 날짜 *
              </label>
              <input
                type="date"
                id="foundDate"
                name="foundDate"
                value={formData.foundDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 (선택)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    이미지를 업로드하거나 클릭하여 선택하세요
                  </span>
                </label>
              </div>
              
              {/* 업로드된 이미지 미리보기 */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex space-x-4">
              <Link
                to="/lost-items"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center"
              >
                취소
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                등록하기
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateLostItemPage;
