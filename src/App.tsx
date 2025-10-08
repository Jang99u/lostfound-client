import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryContext';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import LostItemListPage from './pages/lostitem/LostItemListPage';
import LostItemDetailPage from './pages/lostitem/LostItemDetailPage';
import CreateLostItemPage from './pages/lostitem/CreateLostItemPage';
import MyPage from './pages/MyPage';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/lost-items" element={<LostItemListPage />} />
              <Route path="/lost-items/:id" element={<LostItemDetailPage />} />
              <Route path="/lost-items/create" element={<CreateLostItemPage />} />
              <Route path="/mypage" element={<MyPage />} />
              
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