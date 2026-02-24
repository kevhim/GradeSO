import React, { useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import useGradeStore from './store/useGradeStore';
import LandingPage from './pages/LandingPage';

// Phase 2 modules — lazy loaded, do not edit these imports
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  const { session, setSession, setProfile, darkMode } = useGradeStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  return (
    <div className={darkMode ? 'bg-void text-ghost min-h-screen' : 'bg-ghost text-graphite min-h-screen'}>
      {!session ? (
        <LandingPage />
      ) : (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-plasma font-mono">Loading GradeOS...</div>}>
          <Dashboard />
        </Suspense>
      )}
    </div>
  );
}

export default App;
