import { useState } from 'react';
import { api } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useResume() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const uploadResume = async (file: File, candidateId?: string) => {
    try {
      setUploading(true);
      setError(null);
      setParsedData(null);

      const formData = new FormData();
      formData.append('resume', file);
      if (candidateId) {
        formData.append('candidateId', candidateId);
      }

      // Let axios set Content-Type automatically for FormData (with boundary)
      const response = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParsedData(response.data.data.parsedData);
      return response.data.data;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to upload resume';
      setError(errorMsg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const getResume = async (resumeId: string) => {
    try {
      const response = await api.get(`/resumes/${resumeId}`);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const getCandidateResumes = async (candidateId: string) => {
    try {
      const response = await api.get(`/resumes/candidate/${candidateId}`);
      return response.data.data;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteResume = async (resumeId: string) => {
    try {
      await api.delete(`/resumes/${resumeId}`);
    } catch (err: any) {
      throw err;
    }
  };

  // Use authenticated fetch via axios to download (avoids 401 from direct URL)
  const downloadResume = async (resumeId: string, fileName: string) => {
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(
        `${API_BASE_URL}/resumes/${resumeId}/download`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      throw err;
    }
  };

  return {
    uploadResume,
    getResume,
    getCandidateResumes,
    deleteResume,
    downloadResume,
    uploading,
    error,
    parsedData,
  };
}