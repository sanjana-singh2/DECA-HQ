import { useAuthContext } from '../context/AuthContext';

export function useUser() {
  const { userProfile, loading, refreshProfile } = useAuthContext();
  return { user: userProfile, loading, refreshProfile };
}
