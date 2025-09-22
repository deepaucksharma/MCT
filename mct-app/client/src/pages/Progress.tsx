import { useState } from 'react';
import WeeklyProgressSummary from '../components/visualizations/WeeklyProgressSummary';
import CASReductionGraph from '../components/visualizations/CASReductionGraph';
import BeliefChangeTracker from '../components/visualizations/BeliefChangeTracker';
import PracticeConsistencyHeatMap from '../components/visualizations/PracticeConsistencyHeatMap';
import ExperimentOutcomes from '../components/visualizations/ExperimentOutcomes';
import ProgressInsights from '../components/visualizations/ProgressInsights';

export default function Progress() {
  const [timeframe, setTimeframe] = useState<30 | 60 | 90>(30);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Dashboard</h1>
          <p className="text-gray-600">Track your MCT journey and celebrate your achievements</p>
        </div>

        {/* Timeframe Selector */}
        <div className="mt-4 sm:mt-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  timeframe === days
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTimeframe(days as 30 | 60 | 90)}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Summary Cards */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week</h2>
        <WeeklyProgressSummary />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* CAS Reduction Trends */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">CAS Control Progress</h2>
            <CASReductionGraph days={timeframe} height={350} />
          </section>

          {/* Belief Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Belief Modification</h2>
            <BeliefChangeTracker days={timeframe} />
          </section>

          {/* Experiment Outcomes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Behavioral Experiments</h2>
            <ExperimentOutcomes showDetails={true} />
          </section>
        </div>

        {/* Right Column - Insights & Consistency */}
        <div className="space-y-8">
          {/* Progress Insights */}
          <section>
            <ProgressInsights days={timeframe} />
          </section>

          {/* Practice Consistency */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Practice Consistency</h2>
            <PracticeConsistencyHeatMap weeks={Math.ceil(timeframe / 7)} />
          </section>
        </div>
      </div>

      {/* Additional Information */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Understanding Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-1">CAS Control</h4>
            <p>Lower worry and rumination times indicate better cognitive control. Aim for consistent downward trends.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Practice Consistency</h4>
            <p>Regular ATT and DM practice builds metacognitive skills. Consistency matters more than intensity.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Belief Changes</h4>
            <p>Experiments help modify unhelpful beliefs. Look for reductions in uncontrollability and danger beliefs.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Overall Progress</h4>
            <p>MCT is a gradual process. Small, consistent improvements lead to significant long-term changes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}