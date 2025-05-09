import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'owner' || user.role === 'admin') {
        navigate('/profiles');
      } else {
        navigate('/profiles');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            GamerHub
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tu plataforma para descubrir y gestionar tus juegos favoritos
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;