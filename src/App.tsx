import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import LostItemListPage from './pages/lostitem/LostItemListPage';
import LostItemDetailPage from './pages/lostitem/LostItemDetailPage';
import CreateLostItemPage from './pages/lostitem/CreateLostItemPage';
import MyPage from './pages/MyPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 홈페이지 - 헤더 없이 전체 화면 */}
              <Route path="/" element={<HomePage />} />
              
              {/* 일반 페이지들 - 헤더 포함 */}
              <Route path="/auth/login" element={
                <Layout maxWidth="sm" padding="lg">
                  <LoginPage />
                </Layout>
              } />
              
              <Route path="/lost-items" element={
                <Layout maxWidth="xl" padding="md">
                  <LostItemListPage />
                </Layout>
              } />
              
              <Route path="/lost-items/:id" element={
                <Layout maxWidth="lg" padding="md">
                  <LostItemDetailPage />
                </Layout>
              } />
              
              <Route path="/lost-items/create" element={
                <Layout maxWidth="lg" padding="md">
                  <CreateLostItemPage />
                </Layout>
              } />
              
              <Route path="/mypage" element={
                <Layout maxWidth="xl" padding="md">
                  <MyPage />
                </Layout>
              } />
              
              <Route path="/notifications" element={
                <Layout maxWidth="xl" padding="md">
                  <NotificationsPage />
                </Layout>
              } />
              
              {/* 보호된 라우트 (추후 구현) */}
              {/* <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> */}
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;