import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useScrapedArticles = () => {
  return useQuery({
    queryKey: ['scraped_articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraped_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });
};
