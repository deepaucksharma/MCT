import { Routes, Route } from 'react-router-dom';
import {
  OnboardingJourney,
  DailyEngagementJourney,
  WeeklyProgressionJourney
} from '../components/journeys';

export default function JourneyRoutes() {
  return (
    <Routes>
      <Route path="/onboarding-journey" element={<OnboardingJourney />} />
      <Route path="/daily-journey" element={<DailyEngagementJourney />} />
      <Route path="/weekly-journey" element={<WeeklyProgressionJourney />} />
    </Routes>
  );
}