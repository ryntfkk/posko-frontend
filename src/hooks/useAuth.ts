import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile } from '@/features/auth/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  // Cek token client-side
  useEffect(() => {
    const storedToken = localStorage.getItem('posko_token');
    setToken(storedToken);
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetchProfile();
      return res.data.profile;
    },
    enabled: !!token, // Hanya fetch jika ada token
    retry: false,
  });

  const logout = () => {
    localStorage.removeItem('posko_token');
    queryClient.removeQueries({ queryKey: ['userProfile'] });
    setToken(null);
    router.push('/login');
    router.refresh();
  };

  return {
    user: data || null,
    isLoading: isLoading && !!token, // Loading hanya true jika ada token tapi data belum ada
    isLoggedIn: !!token && !isError,
    logout,
    refetch,
  };
}