import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const PrivateRoute = ({ children, requiredRole, minAge, maxAge, allowedRating }) => {
  const { user, loading } = useAuth();
  const { selectedProfile } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Si el usuario es owner y quiere acceder a una ruta de admin, redirigir a /profiles
    if (user.role === 'owner') {
      return <Navigate to="/profiles" replace />;
    }
    // Si el usuario es admin pero no cumple el rol requerido, redirigir a /admin/users
    if (user.role === 'admin') {
      return <Navigate to="/admin/users" replace />;
    }
    // Por defecto, redirigir al inicio
    return <Navigate to="/" replace />;
  }

  // Validación de edad y clasificación
  if (selectedProfile) {
    const profileAge = selectedProfile.age;
    const profileRating = selectedProfile.allowedRating;

    if (minAge && profileAge < minAge) {
      return (
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center border-2 border-red-400 dark:border-red-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso denegado por edad
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Esta sección requiere una edad mínima de {minAge} años.
          </p>
        </div>
      );
    }

    if (maxAge && profileAge > maxAge) {
      return (
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center border-2 border-red-400 dark:border-red-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso denegado por edad
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Esta sección está restringida para usuarios menores de {maxAge} años.
          </p>
        </div>
      );
    }

    if (allowedRating && !allowedRating.includes(profileRating)) {
      return (
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center border-2 border-red-400 dark:border-red-600">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Acceso denegado por clasificación
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Esta sección requiere una clasificación diferente a la de tu perfil actual.
          </p>
        </div>
      );
    }
  }

  return children;
};

export default PrivateRoute;