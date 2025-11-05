'use client';

import { useEffect } from 'react';
import { useAuthStore, useFieldsStore, useAnalysisStore } from '@/lib/store';

/**
 * Component that syncs Supabase data when user logs in
 * Place this in your layout or protected routes
 */
export function SupabaseSync() {
  const user = useAuthStore((state) => state.user);
  const syncFields = useFieldsStore((state) => state.syncFields);
  const syncAnalyses = useAnalysisStore((state) => state.syncAnalyses);

  useEffect(() => {
    // Sync data when user logs in
    if (user?.id) {
      console.log('🔄 Syncing data for user:', user.id);
      syncFields(user.id);
      syncAnalyses(user.id);
    }
  }, [user?.id, syncFields, syncAnalyses]);

  return null; // This component doesn't render anything
}
