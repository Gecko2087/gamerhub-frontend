import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
import { DEMO_MODE } from './config/api';

function DemoNotice() {
  const { expiresAt } = useAuth();
  const expiry = expiresAt ? new Date(expiresAt) : null;
  return (
    <p className="bg-indigo-950 px-4 py-3 text-center text-sm text-indigo-100" role="status">
      Demo pública · usa datos ficticios.
      {expiry && Number.isFinite(expiry.getTime())
        ? <> Tu sesión termina a las <time dateTime={expiresAt}>{expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>.</>
        : ' Cada sesión dura una hora.'}
    </p>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
        <Router>
          <a href="#main-content" className="skip-link">Saltar al contenido</a>
          <Navbar />
          {DEMO_MODE && <DemoNotice />}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss pauseOnHover theme="colored" />
          <main id="main-content" tabIndex={-1} className="flex-1 w-full min-w-0 flex flex-col p-0 m-0">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={DEMO_MODE ? <Navigate to="/login" replace /> : <RegisterPage />} />
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
