import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSelector from './components/ProfileSelector';
import GameCatalog from './components/GameCatalog';
import GameDetailsPage from './pages/GameDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import UserSettingsPage from './pages/UserSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import LandingPage from './pages/LandingPage';
import { ProfileProvider } from './context/ProfileContext';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profiles from './pages/Profiles';
import Watchlist from './components/Watchlist';
import AdminGamesPage from './pages/AdminGamesPage';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
        <Router>
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss pauseOnHover theme="colored" />
          <main className="min-h-screen flex-1 w-full flex flex-col p-0 m-0">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <GameCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/:id"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <GameDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist/:profileId"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <Watchlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles"
                element={
                  <ProtectedRoute>
                    <Profiles />
                  </ProtectedRoute>
                }
              />
              <Route
              />
              <Route
                path="/catalog/:profileId"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <GameCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/settings"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <UserSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/games"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminGamesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </Router>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
