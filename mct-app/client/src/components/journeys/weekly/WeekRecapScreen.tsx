import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface WeekRecapScreenProps {
  weekNumber: number;
  onContinue: () => void;
  onSkip: () => void;
}

interface WeeklyStats {
  attSessions: number;
  dmPractices: number;
  casLogs: number;
  postponementUses: number;
  experimentsCompleted: number;
  averageSessionTime: number;
  consistencyRate: number;
}

export default function WeekRecapScreen({
  weekNumber,
  onContinue,
  onSkip
}: WeekRecapScreenProps) {
  const [currentView, setCurrentView] = useState<'overview' | 'insights' | 'reflection'>('overview');

  // Mock data - in real app this would come from stored data
  const weeklyStats: WeeklyStats = {
    attSessions: Math.floor(Math.random() * 7) + 3,
    dmPractices: Math.floor(Math.random() * 15) + 10,
    casLogs: Math.floor(Math.random() * 7) + 2,
    postponementUses: Math.floor(Math.random() * 10) + 5,
    experimentsCompleted: Math.floor(Math.random() * 3) + 1,
    averageSessionTime: Math.floor(Math.random() * 5) + 12,
    consistencyRate: Math.floor(Math.random() * 30) + 70
  };

  const achievements = [
    {
      title: "Consistent Practitioner",
      description: `Completed ${weeklyStats.attSessions} ATT sessions`,
      icon: "🎧",
      earned: weeklyStats.attSessions >= 5
    },
    {
      title: "Mindful Observer",
      description: `${weeklyStats.dmPractices} DM check-ins completed`,
      icon: "🧘",
      earned: weeklyStats.dmPractices >= 12
    },
    {
      title: "Pattern Tracker",
      description: `Logged CAS patterns ${weeklyStats.casLogs} times`,
      icon: "📊",
      earned: weeklyStats.casLogs >= 4
    },
    {
      title: "Experiment Explorer",
      description: `Completed ${weeklyStats.experimentsCompleted} behavioral experiments`,
      icon: "🔬",
      earned: weeklyStats.experimentsCompleted >= 1
    }
  ];

  const insights = [
    {
      title: "Attention Control",
      description: "Your ability to shift attention improved 23% this week",
      trend: "improving",
      icon: "🎯"
    },
    {
      title: "Worry Patterns",
      description: "Daily worry time decreased by an average of 8 minutes",
      trend: "improving",
      icon: "📉"
    },
    {
      title: "Metacognitive Awareness",
      description: "You caught yourself in CAS patterns 67% faster than last week",
      trend: "improving",
      icon: "⚡"
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-800">{weeklyStats.attSessions}</div>
          <div className="text-sm text-blue-600">ATT Sessions</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-800">{weeklyStats.dmPractices}</div>
          <div className="text-sm text-green-600">DM Practices</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-800">{weeklyStats.consistencyRate}%</div>
          <div className="text-sm text-purple-600">Consistency</div>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-800">{weeklyStats.averageSessionTime}m</div>
          <div className="text-sm text-orange-600">Avg Session</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">This Week's Achievements</h3>
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                achievement.earned
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  achievement.earned ? 'text-green-900' : 'text-gray-700'
                }`}>
                  {achievement.title}
                </h4>
                <p className={`text-sm ${
                  achievement.earned ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {achievement.description}
                </p>
              </div>
              {achievement.earned && (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Progress Insights</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{insight.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-gray-600 text-sm">{insight.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.trend === 'improving'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {insight.trend === 'improving' ? '↗️ Improving' : '→ Stable'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Key Learning</h3>
        <p className="text-blue-800 text-sm">
          Your progress shows that consistent small practices create significant changes.
          The combination of ATT and DM is strengthening your metacognitive flexibility.
        </p>
      </div>
    </div>
  );

  const renderReflection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Quick Reflection</h3>
        <p className="text-gray-600 text-sm mb-4">
          Take a moment to consider these questions (no need to write anything):
        </p>

        <div className="space-y-4">
          {[
            "What did you notice about your relationship with thoughts this week?",
            "Which practice felt most helpful or interesting?",
            "What patterns are you becoming more aware of?",
            "How has your ability to step back from worries changed?"
          ].map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
            >
              <p className="text-purple-800 text-sm font-medium">{question}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-medium text-amber-900 mb-2">Remember</h3>
        <p className="text-amber-800 text-sm">
          Progress in MCT is often subtle. You're developing skills that will serve you long-term.
          Small shifts in awareness compound into significant changes over time.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <ChartBarIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Week {weekNumber} Recap
          </h2>
        </div>
        <p className="text-gray-600">
          Let's review your progress and insights from this week
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'insights', label: 'Insights' },
          { key: 'reflection', label: 'Reflection' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setCurrentView(tab.key as any)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current View Content */}
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {currentView === 'overview' && renderOverview()}
        {currentView === 'insights' && renderInsights()}
        {currentView === 'reflection' && renderReflection()}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onContinue}
          className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Continue Journey
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Skip Recap
        </button>
      </div>
    </div>
  );
}