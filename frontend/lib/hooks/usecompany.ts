import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useCompany() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/company/profile');
      setCompany(response.data.data);
    } catch (err: any) {
      console.error('Error fetching company:', err);
      setError(err.response?.data?.error || 'Failed to fetch company');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (data: any) => {
    try {
      const response = await api.patch('/company/profile', data);
      setCompany(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update company');
      throw err;
    }
  };

  return { 
    company, 
    loading, 
    error, 
    updateCompany, 
    refetch: fetchCompany 
  };
}