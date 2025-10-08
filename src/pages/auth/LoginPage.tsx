import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', { isLogin, formData });
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        console.log('Calling login API...');
        await login(formData.loginId, formData.password);
        console.log('Login successful!');
      } else {
        console.log('Calling register API...');
        await register(formData.loginId, formData.password);
        console.log('Register successful!');
      }
      // 로그인/회원가입 성공 시 홈으로 이동
      navigate('/');
    } catch (err: any) {
      console.error('Error occurred:', err);
      setError(err.message || '요청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="max-w-md mx-auto px-8 py-16">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? '로그인' : '회원가입'}
          </h1>
          <p className="text-gray-600">
            또는{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
            >
              {isLogin ? '새 계정 만들기' : '기존 계정으로 로그인'}
            </button>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="아이디"
              name="loginId"
              type="text"
              placeholder="아이디를 입력하세요"
              value={formData.loginId}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              label="비밀번호"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              icon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/">
                <Button type="button" variant="outline" className="w-full">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
