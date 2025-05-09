import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export default function ProfileProvider({ children }) {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('selectedProfile');
    if (storedProfile) {
      setSelectedProfile(JSON.parse(storedProfile));
    }
  }, []);

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