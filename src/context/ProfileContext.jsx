import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export default function ProfileProvider({ children }) {
  const { user, loading: checkingSession } = useAuth();
  const userId = user?.id;
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (checkingSession) return;
    if (!userId) {
      setSelectedProfile(null);
      localStorage.removeItem('selectedProfile');
      return;
    }
    try {
      setSelectedProfile(JSON.parse(localStorage.getItem('selectedProfile') ?? 'null'));
    } catch {
      localStorage.removeItem('selectedProfile');
      setSelectedProfile(null);
    }
  }, [userId, checkingSession]);

  const selectProfile = (profile) => {
    setSelectedProfile(profile);
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
  };

  const clearProfile = () => {
    setSelectedProfile(null);
    localStorage.removeItem('selectedProfile');
  };

  return (
    <ProfileContext.Provider
      value={{
        selectedProfile,
        selectProfile,
        clearProfile,
        loading,
        error
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export { ProfileProvider };
