import { useState } from 'react';
import { ExperimentTemplate, ExperimentInstance, ExperimentStep } from '../../types';

interface ExperimentWorkflowProps {
  template?: ExperimentTemplate;
  instance?: ExperimentInstance;
  onSave: (instance: ExperimentInstance) => void;
  onComplete: (instance: ExperimentInstance) => void;
}

export const ExperimentWorkflow: React.FC<ExperimentWorkflowProps> = ({
  template,
  instance,
  onSave,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [experimentData, setExperimentData] = useState<ExperimentInstance>(
    instance || {
      belief_tested: template?.target_belief || '',
      prediction: '',
      safety_behaviors_dropped: [],
      protocol_steps: template?.protocol.steps.map((step, index) => ({
        id: `step-${index}`,
        description: step,
        completed: false
      })) || [],
      metrics: [],
      status: 'planned',
      belief_rating_before: undefined,
      belief_rating_after: undefined
    }
  );

  const steps = [
    'Setup & Prediction',
    'Protocol Execution',
    'Outcome Recording',
    'Belief Re-rating'
  ];

  const handlePredictionSubmit = (prediction: string, beliefRating: number) => {
    const updated = {
      ...experimentData,
      prediction,
      belief_rating_before: beliefRating,
      status: 'in_progress' as const,
      started_at: new Date().toISOString()
    };
    setExperimentData(updated);
    onSave(updated);
    setCurrentStep(1);
  };

  const handleStepComplete = (stepId: string, data?: any, notes?: string) => {
    const updatedSteps = experimentData.protocol_steps.map(step =>
      step.id === stepId
        ? { ...step, completed: true, completed_at: new Date().toISOString(), data, notes }
        : step
    );

    const updated = {
      ...experimentData,
      protocol_steps: updatedSteps
    };
    setExperimentData(updated);
    onSave(updated);

    // Check if all protocol steps are completed
    if (updatedSteps.every(step => step.completed)) {
      setCurrentStep(2);
    }
  };

  const handleOutcomeSubmit = (outcome: string, metrics: any[]) => {
    const updated = {
      ...experimentData,
      outcome,
      metrics: metrics.map(metric => ({
        ...metric,
        recorded_at: new Date().toISOString()
      }))
    };
    setExperimentData(updated);
    onSave(updated);
    setCurrentStep(3);
  };

  const handleCompletionSubmit = (beliefRatingAfter: number, learning: string) => {
    const completed = {
      ...experimentData,
      belief_rating_after: beliefRatingAfter,
      learning,
      status: 'completed' as const,
      completed_at: new Date().toISOString()
    };
    setExperimentData(completed);
    onComplete(completed);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PredictionEntry
            template={template}
            onSubmit={handlePredictionSubmit}
            initialPrediction={experimentData.prediction}
            initialRating={experimentData.belief_rating_before}
          />
        );
      case 1:
        return (
          <ProtocolExecution
            steps={experimentData.protocol_steps}
            template={template}
            onStepComplete={handleStepComplete}
          />
        );
      case 2:
        return (
          <OutcomeRecording
            template={template}
            onSubmit={handleOutcomeSubmit}
            initialOutcome={experimentData.outcome}
            initialMetrics={experimentData.metrics}
          />
        );
      case 3:
        return (
          <BeliefRerating
            template={template}
            experiment={experimentData}
            onSubmit={handleCompletionSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="experiment-workflow">
      <div className="workflow-header">
        <h2>{template?.name || 'Custom Experiment'}</h2>
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? 'active' : ''} ${
                index < currentStep ? 'completed' : ''
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="workflow-content">
        {renderStepContent()}
      </div>
    </div>
  );
};

// Sub-components for each step
interface PredictionEntryProps {
  template?: ExperimentTemplate;
  onSubmit: (prediction: string, beliefRating: number) => void;
  initialPrediction?: string;
  initialRating?: number;
}

const PredictionEntry: React.FC<PredictionEntryProps> = ({
  template,
  onSubmit,
  initialPrediction = '',
  initialRating
}) => {
  const [prediction, setPrediction] = useState(initialPrediction);
  const [beliefRating, setBeliefRating] = useState(initialRating || 50);
  const [safetyBehaviors, setSafetyBehaviors] = useState<string[]>([]);

  return (
    <div className="prediction-entry">
      <div className="belief-context">
        <h3>Belief Under Test</h3>
        <p className="belief-statement">{template?.target_belief}</p>

        <h4>Hypothesis</h4>
        <p>{template?.hypothesis}</p>
      </div>

      <div className="prediction-input">
        <h4>Your Specific Prediction</h4>
        <p>What exactly do you predict will happen? Be specific and measurable.</p>
        <textarea
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          placeholder="e.g., I predict I'll worry for at least 2 hours and won't be able to postpone more than 2 episodes..."
          rows={4}
        />
      </div>

      <div className="belief-rating">
        <h4>Current Belief Strength</h4>
        <p>How strongly do you believe "{template?.target_belief}" right now?</p>
        <div className="rating-slider">
          <input
            type="range"
            min="0"
            max="100"
            value={beliefRating}
            onChange={(e) => setBeliefRating(Number(e.target.value))}
          />
          <span>{beliefRating}/100</span>
        </div>
      </div>

      <div className="safety-behaviors">
        <h4>Safety Behaviors to Drop</h4>
        <p>List any safety behaviors you normally use that you'll avoid during this experiment:</p>
        <div className="behavior-list">
          {safetyBehaviors.map((behavior, index) => (
            <div key={index} className="behavior-item">
              <input
                value={behavior}
                onChange={(e) => {
                  const updated = [...safetyBehaviors];
                  updated[index] = e.target.value;
                  setSafetyBehaviors(updated);
                }}
              />
              <button onClick={() => setSafetyBehaviors(prev => prev.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          ))}
          <button onClick={() => setSafetyBehaviors(prev => [...prev, ''])}>
            Add Safety Behavior
          </button>
        </div>
      </div>

      <button
        onClick={() => onSubmit(prediction, beliefRating)}
        disabled={!prediction.trim()}
        className="start-experiment-btn"
      >
        Start Experiment
      </button>
    </div>
  );
};

interface ProtocolExecutionProps {
  steps: ExperimentStep[];
  template?: ExperimentTemplate;
  onStepComplete: (stepId: string, data?: any, notes?: string) => void;
}

const ProtocolExecution: React.FC<ProtocolExecutionProps> = ({
  steps,
  template,
  onStepComplete
}) => {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [stepData, setStepData] = useState<any>({});
  const [stepNotes, setStepNotes] = useState<string>('');

  return (
    <div className="protocol-execution">
      <h3>Protocol Steps</h3>
      <p>{template?.protocol.description}</p>

      {template?.protocol.duration && (
        <p><strong>Duration:</strong> {template.protocol.duration}</p>
      )}

      {template?.protocol.frequency && (
        <p><strong>Frequency:</strong> {template.protocol.frequency}</p>
      )}

      <div className="steps-list">
        {steps.map((step, index) => (
          <div key={step.id} className={`step-item ${step.completed ? 'completed' : ''}`}>
            <div className="step-header">
              <span className="step-number">{index + 1}</span>
              <span className="step-description">{step.description}</span>
              {step.completed && <span className="completed-badge">✓</span>}
            </div>

            {!step.completed && (
              <div className="step-actions">
                <button
                  onClick={() => setActiveStepId(step.id)}
                  className="mark-complete-btn"
                >
                  Mark as Complete
                </button>
              </div>
            )}

            {activeStepId === step.id && (
              <div className="step-completion-form">
                <textarea
                  placeholder="Add any notes about this step..."
                  value={stepNotes}
                  onChange={(e) => setStepNotes(e.target.value)}
                  rows={3}
                />
                <div className="form-actions">
                  <button
                    onClick={() => {
                      onStepComplete(step.id, stepData, stepNotes);
                      setActiveStepId(null);
                      setStepNotes('');
                      setStepData({});
                    }}
                    className="confirm-btn"
                  >
                    Confirm Completion
                  </button>
                  <button
                    onClick={() => setActiveStepId(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface OutcomeRecordingProps {
  template?: ExperimentTemplate;
  onSubmit: (outcome: string, metrics: any[]) => void;
  initialOutcome?: string;
  initialMetrics?: any[];
}

const OutcomeRecording: React.FC<OutcomeRecordingProps> = ({
  template,
  onSubmit,
  initialOutcome = '',
  initialMetrics = []
}) => {
  const [outcome, setOutcome] = useState(initialOutcome);
  const [metricValues, setMetricValues] = useState<any[]>(
    initialMetrics.length ? initialMetrics : (template?.metrics || []).map(m => ({ name: m.name, value: '', unit: m.type }))
  );

  const handleMetricChange = (index: number, value: any) => {
    const updated = [...metricValues];
    updated[index] = { ...updated[index], value };
    setMetricValues(updated);
  };

  return (
    <div className="outcome-recording">
      <h3>Record Experiment Outcome</h3>

      <div className="outcome-description">
        <h4>What Actually Happened?</h4>
        <p>Describe the actual outcome compared to your prediction:</p>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder="Describe what actually happened during the experiment..."
          rows={4}
        />
      </div>

      <div className="metrics-recording">
        <h4>Metrics</h4>
        {template?.metrics.map((metric, index) => (
          <div key={metric.name} className="metric-input">
            <label>{metric.name}</label>
            <p className="metric-description">{metric.description}</p>
            {metric.type === 'scale' && (
              <div className="scale-input">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={metricValues[index]?.value || 0}
                  onChange={(e) => handleMetricChange(index, Number(e.target.value))}
                />
                <span>{metricValues[index]?.value || 0}/100</span>
              </div>
            )}
            {metric.type === 'number' && (
              <input
                type="number"
                value={metricValues[index]?.value || ''}
                onChange={(e) => handleMetricChange(index, Number(e.target.value))}
              />
            )}
            {metric.type === 'percentage' && (
              <div className="percentage-input">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={metricValues[index]?.value || ''}
                  onChange={(e) => handleMetricChange(index, Number(e.target.value))}
                />
                <span>%</span>
              </div>
            )}
            {metric.type === 'boolean' && (
              <select
                value={metricValues[index]?.value || ''}
                onChange={(e) => handleMetricChange(index, e.target.value === 'true')}
              >
                <option value="">Select...</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubmit(outcome, metricValues)}
        disabled={!outcome.trim()}
        className="record-outcome-btn"
      >
        Record Outcome
      </button>
    </div>
  );
};

interface BeliefReratingProps {
  template?: ExperimentTemplate;
  experiment: ExperimentInstance;
  onSubmit: (beliefRatingAfter: number, learning: string) => void;
}

const BeliefRerating: React.FC<BeliefReratingProps> = ({
  template,
  experiment,
  onSubmit
}) => {
  const [beliefRatingAfter, setBeliefRatingAfter] = useState(50);
  const [learning, setLearning] = useState('');

  return (
    <div className="belief-rerating">
      <h3>Belief Re-rating & Learning</h3>

      <div className="belief-comparison">
        <h4>Belief Strength Comparison</h4>
        <p className="belief-statement">"{template?.target_belief}"</p>

        <div className="rating-comparison">
          <div className="before-rating">
            <label>Before Experiment:</label>
            <span className="rating-value">{experiment.belief_rating_before}/100</span>
          </div>

          <div className="after-rating">
            <label>After Experiment:</label>
            <div className="rating-slider">
              <input
                type="range"
                min="0"
                max="100"
                value={beliefRatingAfter}
                onChange={(e) => setBeliefRatingAfter(Number(e.target.value))}
              />
              <span>{beliefRatingAfter}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="learning-statement">
        <h4>Learning Statement</h4>
        <p>In one sentence, what did you learn from this experiment?</p>

        {template?.learning_options && (
          <div className="learning-options">
            <p>Common learnings from this experiment:</p>
            <ul>
              {template.learning_options.map((option, index) => (
                <li key={index} onClick={() => setLearning(option)}>
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          value={learning}
          onChange={(e) => setLearning(e.target.value)}
          placeholder="What did you learn about your belief?"
          rows={3}
        />
      </div>

      <div className="experiment-summary">
        <h4>Experiment Summary</h4>
        <p><strong>Prediction:</strong> {experiment.prediction}</p>
        <p><strong>Outcome:</strong> {experiment.outcome}</p>
        <p><strong>Belief Change:</strong> {experiment.belief_rating_before} → {beliefRatingAfter}</p>
      </div>

      <button
        onClick={() => onSubmit(beliefRatingAfter, learning)}
        disabled={!learning.trim()}
        className="complete-experiment-btn"
      >
        Complete Experiment
      </button>
    </div>
  );
};

export default ExperimentWorkflow;