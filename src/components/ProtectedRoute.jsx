import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, hasRole } = useAuth();
  const { selectedProfile } = useProfile();
  const location = useLocation();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !user && !redirected) {
      toast.error('Por favor, inicia sesión para acceder a esta página');
      setRedirected(true);
    }
  }, [user, loading, redirected]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si la ruta requiere un perfil, solo verifica que haya usuario y perfil seleccionado
  if (requiredRole === 'profile') {
    if (!selectedProfile) {
      return <Navigate to="/profiles" state={{ from: location }} replace />;
    }
    // Si hay perfil seleccionado, permite el acceso
  } else if (requiredRole && !hasRole(requiredRole)) {
    toast.error('No tienes permiso para acceder a esta página');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
