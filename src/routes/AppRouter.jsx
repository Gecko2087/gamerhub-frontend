import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profiles from '../pages/Profiles';
import Catalog from '../pages/Catalog';
import Watchlist from '../pages/Watchlist';
import GameDetailsPage from '../pages/GameDetailsPage';
import NotFound from '../pages/NotFound';
import { useAuth } from '../auth/AuthContext';

export default function AppRouter() {
  const { token } = useAuth();

  return (
    <Routes>
      {!token ? (
        <>
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </>
      ) : (
        <>
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/catalog/:profileId" element={<Catalog />} />
          <Route path="/watchlist/:profileId" element={<Watchlist />} />
          <Route path="/games/:id" element={<GameDetailsPage />} />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}
