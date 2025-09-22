import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';
import Program from './pages/Program';
import Log from './pages/Log';
import Progress from './pages/Progress';
import More from './pages/More';
import ATTSession from './pages/exercises/ATTSession';
import DMPractice from './pages/exercises/DMPractice';
import Experiments from './pages/Experiments';
import SARBuilder from './pages/SARBuilder';
import {
  OnboardingJourney,
  DailyEngagementJourney,
  WeeklyProgressionJourney
} from './components/journeys';

function App() {
  const { settings, fetchSettings } = useStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <Routes>
        {!settings.onboarding_completed ? (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/onboarding-journey" element={<OnboardingJourney />} />
            <Route path="*" element={<Navigate to="/onboarding-journey" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/today" replace />} />
              <Route path="today" element={<Today />} />
              <Route path="program" element={<Program />} />
              <Route path="log" element={<Log />} />
              <Route path="progress" element={<Progress />} />
              <Route path="more" element={<More />} />
              <Route path="experiments" element={<Experiments />} />
              <Route path="sar-builder" element={<SARBuilder />} />
            </Route>
            <Route path="/exercises/att" element={<ATTSession />} />
            <Route path="/exercises/dm" element={<DMPractice />} />
            <Route path="/daily-journey" element={<DailyEngagementJourney />} />
            <Route path="/weekly-journey" element={<WeeklyProgressionJourney />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;