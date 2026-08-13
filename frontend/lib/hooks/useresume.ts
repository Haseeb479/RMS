import { useState } from 'react';
import { api } from '@/lib/api';

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

      const response = await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParsedData(response.data.data.parsedData);
      return response.data.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to upload resume';
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

  const downloadResume = async (resumeId: string, fileName: string) => {
    try {
      window.location.href = `/api/resumes/${resumeId}/download`;
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