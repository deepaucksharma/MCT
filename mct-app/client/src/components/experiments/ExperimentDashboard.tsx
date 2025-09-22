import React, { useState, useEffect } from 'react';
import { ExperimentTemplate, ExperimentInstance } from '../../types';
import ExperimentSelector from './ExperimentSelector';
import ExperimentWorkflow from './ExperimentWorkflow';
import { getExperimentTemplate } from './experimentTemplates';

interface ExperimentDashboardProps {
  currentWeek?: number;
}

export const ExperimentDashboard: React.FC<ExperimentDashboardProps> = ({
  currentWeek
}) => {
  const [experiments, setExperiments] = useState<ExperimentInstance[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExperimentTemplate | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<ExperimentInstance | null>(null);
  const [view, setView] = useState<'dashboard' | 'select' | 'experiment'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const response = await fetch('/api/experiments');
      const data = await response.json();
      setExperiments(data);
    } catch (error) {
      console.error('Error loading experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: ExperimentTemplate) => {
    setSelectedTemplate(template);
    setActiveExperiment(null);
    setView('experiment');
  };

  const handleEditExperiment = (experiment: ExperimentInstance) => {
    const template = experiment.template_id ? getExperimentTemplate(experiment.template_id) : null;
    setSelectedTemplate(template || null);
    setActiveExperiment(experiment);
    setView('experiment');
  };

  const handleSaveExperiment = async (experiment: ExperimentInstance) => {
    try {
      if (experiment.id) {
        // Update existing
        const response = await fetch(`/api/experiments/${experiment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(experiment)
        });
        const updated = await response.json();
        setExperiments(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        // Create new
        const response = await fetch('/api/experiments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...experiment,
            template_id: selectedTemplate?.id,
            week_number: currentWeek
          })
        });
        const created = await response.json();
        setExperiments(prev => [...prev, created]);
      }
    } catch (error) {
      console.error('Error saving experiment:', error);
    }
  };

  const handleCompleteExperiment = async (experiment: ExperimentInstance) => {
    try {
      if (experiment.id) {
        const response = await fetch(`/api/experiments/${experiment.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outcome: experiment.outcome,
            learning: experiment.learning,
            belief_rating_after: experiment.belief_rating_after
          })
        });
        const completed = await response.json();
        setExperiments(prev => prev.map(e => e.id === completed.id ? completed : e));
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error completing experiment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'text-blue-600';
      case 'in_progress': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getBeliefChange = (experiment: ExperimentInstance) => {
    if (experiment.belief_rating_before && experiment.belief_rating_after) {
      const change = experiment.belief_rating_after - experiment.belief_rating_before;
      return change;
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading experiments...</div>;
  }

  if (view === 'select') {
    return (
      <div className="experiment-view">
        <div className="view-header">
          <button onClick={() => setView('dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
        <ExperimentSelector
          onSelectTemplate={handleSelectTemplate}
          currentWeek={currentWeek}
        />
      </div>
    );
  }

  if (view === 'experiment') {
    return (
      <div className="experiment-view">
        <div className="view-header">
          <button onClick={() => setView('dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
        <ExperimentWorkflow
          template={selectedTemplate || undefined}
          instance={activeExperiment || undefined}
          onSave={handleSaveExperiment}
          onComplete={handleCompleteExperiment}
        />
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="experiment-dashboard">
      <div className="dashboard-header">
        <h1>Behavioral Experiments</h1>
        <p>Test your metacognitive beliefs through direct experience</p>
        <button
          onClick={() => setView('select')}
          className="new-experiment-btn"
        >
          Start New Experiment
        </button>
      </div>

      <div className="experiments-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Experiments</h3>
            <span className="summary-number">{experiments.length}</span>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <span className="summary-number">
              {experiments.filter(e => e.status === 'completed').length}
            </span>
          </div>
          <div className="summary-card">
            <h3>In Progress</h3>
            <span className="summary-number">
              {experiments.filter(e => e.status === 'in_progress').length}
            </span>
          </div>
          <div className="summary-card">
            <h3>Average Belief Change</h3>
            <span className="summary-number">
              {experiments.filter(e => e.status === 'completed' && getBeliefChange(e) !== null)
                .reduce((acc, e) => acc + (getBeliefChange(e) || 0), 0) /
                Math.max(1, experiments.filter(e => e.status === 'completed' && getBeliefChange(e) !== null).length)
                || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="experiments-list">
        <h2>Your Experiments</h2>

        {experiments.length === 0 ? (
          <div className="empty-state">
            <p>You haven't started any experiments yet.</p>
            <button
              onClick={() => setView('select')}
              className="start-first-btn"
            >
              Start Your First Experiment
            </button>
          </div>
        ) : (
          <div className="experiments-grid">
            {experiments.map((experiment) => (
              <div key={experiment.id} className="experiment-item">
                <div className="experiment-header">
                  <h3>{experiment.belief_tested}</h3>
                  <span className={`status ${getStatusColor(experiment.status)}`}>
                    {experiment.status}
                  </span>
                </div>

                <div className="experiment-details">
                  <p><strong>Prediction:</strong> {experiment.prediction}</p>

                  {experiment.status === 'in_progress' && (
                    <div className="progress-info">
                      <p>Steps completed: {experiment.protocol_steps.filter(s => s.completed).length} / {experiment.protocol_steps.length}</p>
                    </div>
                  )}

                  {experiment.status === 'completed' && (
                    <div className="completion-info">
                      <p><strong>Outcome:</strong> {experiment.outcome}</p>
                      <p><strong>Learning:</strong> {experiment.learning}</p>
                      <div className="belief-change">
                        <strong>Belief Change:</strong>
                        <span className="rating-change">
                          {experiment.belief_rating_before} → {experiment.belief_rating_after}
                          {getBeliefChange(experiment) && (
                            <span className={`change-indicator ${getBeliefChange(experiment)! < 0 ? 'positive' : 'negative'}`}>
                              ({getBeliefChange(experiment)! > 0 ? '+' : ''}{getBeliefChange(experiment)})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="experiment-meta">
                    {experiment.created_at && (
                      <span className="created-date">
                        Created: {new Date(experiment.created_at).toLocaleDateString()}
                      </span>
                    )}
                    {experiment.completed_at && (
                      <span className="completed-date">
                        Completed: {new Date(experiment.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="experiment-actions">
                  {experiment.status !== 'completed' && (
                    <button
                      onClick={() => handleEditExperiment(experiment)}
                      className="continue-btn"
                    >
                      {experiment.status === 'planned' ? 'Start' : 'Continue'}
                    </button>
                  )}
                  {experiment.status === 'completed' && (
                    <button
                      onClick={() => handleEditExperiment(experiment)}
                      className="view-btn"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDashboard;