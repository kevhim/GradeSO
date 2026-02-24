import React, { useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import useGradeStore from './store/useGradeStore';
import LandingPage from './pages/LandingPage';

// Phase 2 modules — lazy loaded, do not edit these imports
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  const { session, setSession, fetchTelemetryData, isLoading } = useGradeStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTelemetryData(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchTelemetryData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loader = (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A14] text-[#7B61FF] font-fira gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-[#7B61FF] border-t-transparent shadow-[0_0_15px_#7B61FF] animate-spin"></div>
      <span className="tracking-widest text-[10px] uppercase">// SYNCING TELEMETRY</span>
    </div>
  );

  return (
    <div className="bg-[#0A0A14] text-[#F0EFF4] min-h-screen selection:bg-[#7B61FF]/30">
      {!session ? (
        <LandingPage />
      ) : (
        <Suspense fallback={loader}>
          {isLoading ? loader : <Dashboard />}
        </Suspense>
      )}
    </div>
  );
}

export default App;
