import React, { useState } from 'react';
import { ExperimentTemplate } from '../../types';
import { EXPERIMENT_TEMPLATES, getExperimentsByWeek, getExperimentsByDifficulty } from './experimentTemplates';

interface ExperimentSelectorProps {
  onSelectTemplate: (template: ExperimentTemplate) => void;
  currentWeek?: number;
}

export const ExperimentSelector: React.FC<ExperimentSelectorProps> = ({
  onSelectTemplate,
  currentWeek
}) => {
  const [filterBy, setFilterBy] = useState<'all' | 'week' | 'difficulty'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'moderate' | 'challenging'>('easy');

  const getFilteredExperiments = (): ExperimentTemplate[] => {
    switch (filterBy) {
      case 'week':
        return currentWeek ? getExperimentsByWeek(currentWeek) : EXPERIMENT_TEMPLATES;
      case 'difficulty':
        return getExperimentsByDifficulty(selectedDifficulty);
      default:
        return EXPERIMENT_TEMPLATES;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'challenging': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const experiments = getFilteredExperiments();

  return (
    <div className="experiment-selector">
      <div className="selector-header">
        <h2>Choose an Experiment</h2>
        <p>Select a behavioral experiment to test your metacognitive beliefs:</p>
      </div>

      <div className="filter-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterBy === 'all' ? 'active' : ''}`}
            onClick={() => setFilterBy('all')}
          >
            All Experiments
          </button>
          {currentWeek && (
            <button
              className={`filter-tab ${filterBy === 'week' ? 'active' : ''}`}
              onClick={() => setFilterBy('week')}
            >
              Week {currentWeek}
            </button>
          )}
          <button
            className={`filter-tab ${filterBy === 'difficulty' ? 'active' : ''}`}
            onClick={() => setFilterBy('difficulty')}
          >
            By Difficulty
          </button>
        </div>

        {filterBy === 'difficulty' && (
          <div className="difficulty-selector">
            <label>Difficulty Level:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
            </select>
          </div>
        )}
      </div>

      <div className="experiments-grid">
        {experiments.map((template) => (
          <div key={template.id} className="experiment-card">
            <div className="card-header">
              <h3>{template.name}</h3>
              <div className="card-badges">
                <span className={`difficulty-badge ${getDifficultyColor(template.difficulty_level)}`}>
                  {template.difficulty_level}
                </span>
                {template.recommended_week && (
                  <span className="week-badge">
                    Week {template.recommended_week}
                  </span>
                )}
              </div>
            </div>

            <div className="card-content">
              <div className="target-belief">
                <strong>Target Belief:</strong>
                <p>"{template.target_belief}"</p>
              </div>

              <div className="hypothesis">
                <strong>Hypothesis:</strong>
                <p>{template.hypothesis}</p>
              </div>

              <div className="protocol-summary">
                <strong>Protocol:</strong>
                <p>{template.protocol.description}</p>
                {template.protocol.duration && (
                  <p><strong>Duration:</strong> {template.protocol.duration}</p>
                )}
              </div>

              <div className="success-criteria">
                <strong>Success Indicators:</strong>
                <ul>
                  {template.success_criteria.slice(0, 2).map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>

              {template.common_outcome && (
                <div className="common-outcome">
                  <strong>Typical Outcome:</strong>
                  <p>"{template.common_outcome}"</p>
                </div>
              )}
            </div>

            <div className="card-actions">
              <button
                onClick={() => onSelectTemplate(template)}
                className="select-experiment-btn"
              >
                Start This Experiment
              </button>
            </div>
          </div>
        ))}
      </div>

      {experiments.length === 0 && (
        <div className="no-experiments">
          <p>No experiments found for the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ExperimentSelector;