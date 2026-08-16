import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface CareerPerk {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface CareerSiteSettings {
  name?: string;
  slug?: string;
  description?: string;
  website?: string;
  careerHeadline?: string;
  careerSubtitle?: string;
  careerBanner?: string;
  careerColor?: string;
  careerPerks?: CareerPerk[] | string;
  socialLinks?: SocialLinks | string;
}

export function useCareerSite() {
  const [settings, setSettings] = useState<CareerSiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/company/profile');
      const company = res.data.data;
      
      let parsedPerks: CareerPerk[] = [];
      if (company.careerPerks) {
        try {
          parsedPerks = typeof company.careerPerks === 'string' ? JSON.parse(company.careerPerks) : company.careerPerks;
        } catch {
          parsedPerks = [];
        }
      }

      let parsedSocial: SocialLinks = {};
      if (company.socialLinks) {
        try {
          parsedSocial = typeof company.socialLinks === 'string' ? JSON.parse(company.socialLinks) : company.socialLinks;
        } catch {
          parsedSocial = {};
        }
      }

      setSettings({
        ...company,
        careerPerks: parsedPerks,
        socialLinks: parsedSocial,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch career site settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (data: Partial<CareerSiteSettings>) => {
    try {
      const payload: any = { ...data };
      if (data.careerPerks && typeof data.careerPerks !== 'string') {
        payload.careerPerks = JSON.stringify(data.careerPerks);
      }
      if (data.socialLinks && typeof data.socialLinks !== 'string') {
        payload.socialLinks = JSON.stringify(data.socialLinks);
      }

      const res = await api.patch('/company/profile', payload);
      await fetchSettings();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to update career site.');
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
}
