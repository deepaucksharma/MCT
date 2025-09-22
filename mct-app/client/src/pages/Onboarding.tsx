import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store';
import { assessmentApi } from '../services/api';
import { Assessment, UserSettings } from '../types';

const steps = [
  'welcome',
  'about',
  'privacy',
  'assessment',
  'beliefs',
  'goals',
  'schedule',
  'complete'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, updateSettings } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<Partial<Assessment>>({
    assessment_type: 'initial',
    worry_baseline: 50,
    rumination_baseline: 50,
    monitoring_baseline: 50,
    uncontrollability_belief: 50,
    danger_belief: 50,
    positive_belief: 50,
    triggers: [],
    goals: []
  });
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    att_reminder_time: '20:00',
    dm_reminder_times: ['08:00', '13:00', '18:00'],
    postponement_slot_start: '18:30',
    postponement_slot_duration: 15,
    notifications_enabled: true
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboardingProcess = async () => {
    try {
      // Save assessment
      await assessmentApi.create(assessment as Assessment);

      // Update settings
      await updateSettings(settings);

      // Mark onboarding as complete
      await completeOnboarding();

      toast.success('Welcome to your MCT journey!');
      navigate('/today');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    }
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Your Journey
            </h1>
            <p className="text-lg text-gray-600">
              Pocket Guide to a Calmer Mind uses Metacognitive Therapy (MCT) to help you develop a healthier relationship with your thoughts.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• 8-10 week structured program</li>
                <li>• Daily attention training exercises</li>
                <li>• Practical techniques for managing worry</li>
                <li>• Progress tracking and insights</li>
              </ul>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Understanding MCT
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                MCT is different from other approaches. We focus on HOW you relate to your thoughts, not their content.
              </p>
              <p>
                The Cognitive Attentional Syndrome (CAS) consists of:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Worry and rumination</li>
                <li>Threat monitoring</li>
                <li>Unhelpful coping behaviors</li>
              </ul>
              <p>
                Through this program, you'll learn to recognize and step out of these patterns.
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-amber-800">
                <strong>Important:</strong> This is not therapy or crisis care. If you're experiencing severe distress or thoughts of self-harm, please seek professional help immediately.
              </p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Privacy
            </h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Data Storage</h3>
                <p className="text-green-800">
                  All your data is stored locally on your device. Nothing is sent to external servers.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Your Control</h3>
                <p className="text-blue-800">
                  You can export or delete your data at any time from the Settings menu.
                </p>
              </div>
              <p className="text-gray-600">
                By continuing, you confirm that you are 18 years or older and understand that this app is for self-help purposes only.
              </p>
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Initial Assessment
            </h2>
            <p className="text-gray-600">
              Rate your current experience with worry, rumination, and monitoring (0 = none, 100 = constant)
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily worry time: {assessment.worry_baseline}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.worry_baseline}
                  onChange={(e) => setAssessment({
                    ...assessment,
                    worry_baseline: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily rumination time: {assessment.rumination_baseline}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.rumination_baseline}
                  onChange={(e) => setAssessment({
                    ...assessment,
                    rumination_baseline: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threat monitoring: {assessment.monitoring_baseline}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.monitoring_baseline}
                  onChange={(e) => setAssessment({
                    ...assessment,
                    monitoring_baseline: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 'beliefs':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Metacognitive Beliefs
            </h2>
            <p className="text-gray-600">
              Rate how much you agree with these statements (0 = not at all, 100 = completely)
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  "My worry is uncontrollable": {assessment.uncontrollability_belief}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.uncontrollability_belief}
                  onChange={(e) => setAssessment({
                    ...assessment,
                    uncontrollability_belief: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  "Worry is dangerous": {assessment.danger_belief}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.danger_belief}
                  onChange={(e) => setAssessment({
                    ...assessment,
                    danger_belief: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  "Worry helps me prepare": {assessment.positive_belief}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.positive_belief}
                  onChange={(e) => setAssessment({
                    ...assessment,
                    positive_belief: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Goals
            </h2>
            <p className="text-gray-600">
              What would you like to achieve? (Focus on process goals, not content)
            </p>
            <div className="space-y-3">
              {[
                'Reduce daily worry time to under 30 minutes',
                'Stop checking behaviors',
                'Practice ATT daily',
                'Complete weekly experiments',
                'Develop flexible attention'
              ].map((goal) => (
                <label key={goal} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={assessment.goals?.includes(goal)}
                    onChange={(e) => {
                      const goals = assessment.goals || [];
                      if (e.target.checked) {
                        setAssessment({ ...assessment, goals: [...goals, goal] });
                      } else {
                        setAssessment({
                          ...assessment,
                          goals: goals.filter(g => g !== goal)
                        });
                      }
                    }}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <span className="text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Daily Schedule
            </h2>
            <p className="text-gray-600">
              Set your practice times for optimal consistency
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ATT Session Time
                </label>
                <input
                  type="time"
                  value={settings.att_reminder_time}
                  onChange={(e) => setSettings({
                    ...settings,
                    att_reminder_time: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  12-15 minutes, preferably in the evening
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Worry Postponement Slot
                </label>
                <input
                  type="time"
                  value={settings.postponement_slot_start}
                  onChange={(e) => setSettings({
                    ...settings,
                    postponement_slot_start: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  15-minute window for postponed worries
                </p>
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications_enabled: e.target.checked
                    })}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <span className="text-gray-700">Enable reminders</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Setup Complete!
            </h2>
            <p className="text-gray-600">
              You're ready to begin your MCT journey. Remember:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-700">
              <li>• Practice is more important than perfection</li>
              <li>• Focus on the process, not the content</li>
              <li>• Be patient with yourself</li>
              <li>• Track your progress daily</li>
            </ul>
            <button
              onClick={completeOnboardingProcess}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Start Your Journey
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length - 1 && (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}