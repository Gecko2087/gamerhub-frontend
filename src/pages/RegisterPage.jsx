import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profiles');
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
            Únete a nuestra comunidad de gamers
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage; 