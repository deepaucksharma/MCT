import React, { useState, useEffect } from 'react';

interface FidelityWarningProps {
  text: string;
  onTextChange: (text: string) => void;
  placeholder?: string;
  label?: string;
  showWarning?: boolean;
}

interface FidelityAlert {
  type: 'content' | 'reassurance' | 'process' | null;
  message: string;
  suggestions: string[];
}

const FidelityWarning: React.FC<FidelityWarningProps> = ({
  text,
  onTextChange,
  placeholder = "Enter process-focused notes only...",
  label = "Notes",
  showWarning = true
}) => {
  const [alert, setAlert] = useState<FidelityAlert>({ type: null, message: '', suggestions: [] });
  const [isTyping, setIsTyping] = useState(false);

  // Content analysis keywords
  const contentKeywords = [
    'what if', 'probably', 'might happen', 'could be', 'realistic',
    'likely', 'chance of', 'possibility', 'scenario', 'outcome',
    'analyze', 'think through', 'figure out', 'solve', 'plan for'
  ];

  // Reassurance-seeking patterns
  const reassurancePatterns = [
    'is this normal', 'should i worry', 'am i being', 'is it okay',
    'what do you think', 'does this mean', 'is this bad', 'help me understand',
    'reassure', 'tell me', 'confirm', 'validate'
  ];

  // Process-focused keywords (positive indicators)
  const processFocusedKeywords = [
    'noticed', 'observed', 'postponed', 'refocused', 'minutes', 'times',
    'practiced', 'att', 'detached mindfulness', 'attention', 'urge rating'
  ];

  const analyzeText = (inputText: string): FidelityAlert => {
    if (!inputText || inputText.length < 10) {
      return { type: null, message: '', suggestions: [] };
    }

    const lowerText = inputText.toLowerCase();

    // Check for content analysis
    const contentMatches = contentKeywords.filter(keyword => lowerText.includes(keyword));
    if (contentMatches.length > 0) {
      return {
        type: 'content',
        message: 'I notice you\'re focusing on thought content. In MCT, we focus on HOW you relate to thoughts, not WHAT they\'re about.',
        suggestions: [
          'How many minutes did you spend on this thought?',
          'Did you successfully postpone the episode?',
          'What was your urge rating (0-100)?',
          'Did you use ATT or DM to refocus?'
        ]
      };
    }

    // Check for reassurance-seeking
    const reassuranceMatches = reassurancePatterns.filter(pattern => lowerText.includes(pattern));
    if (reassuranceMatches.length > 0) {
      return {
        type: 'reassurance',
        message: 'Seeking reassurance maintains the worry problem. Let\'s focus on your process skills instead.',
        suggestions: [
          'Notice the urge for reassurance and rate it 0-100',
          'Postpone this worry to your designated time slot',
          'Practice ATT for 12 minutes to strengthen attention control',
          'Use detached mindfulness to observe without engaging'
        ]
      };
    }

    // Check for lengthy narrative (likely content)
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 2 && inputText.length > 150) {
      return {
        type: 'content',
        message: 'Long descriptions often contain thought content. Keep notes brief and process-focused.',
        suggestions: [
          'Worry duration: X minutes',
          'Postponement: Successful/Unsuccessful',
          'Attention technique used: ATT/DM/SAR',
          'Refocus attempts: X times'
        ]
      };
    }

    // Positive feedback for process-focused content
    const processMatches = processFocusedKeywords.filter(keyword => lowerText.includes(keyword));
    if (processMatches.length > 0) {
      return {
        type: 'process',
        message: 'Great! This is exactly the kind of process-focused tracking that supports MCT.',
        suggestions: []
      };
    }

    return { type: null, message: '', suggestions: [] };
  };

  useEffect(() => {
    if (!showWarning) return;

    const timeoutId = setTimeout(() => {
      setIsTyping(false);
      const analysis = analyzeText(text);
      setAlert(analysis);
    }, 1000);

    setIsTyping(true);
    return () => clearTimeout(timeoutId);
  }, [text, showWarning]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'content':
      case 'reassurance':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'process':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return '';
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'content':
      case 'reassurance':
        return '⚠️';
      case 'process':
        return '✅';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="fidelity-input" className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>

        <textarea
          id="fidelity-input"
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            alert.type === 'content' || alert.type === 'reassurance'
              ? 'border-red-300 bg-red-50'
              : alert.type === 'process'
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300'
          }`}
          rows={3}
        />

        {isTyping && showWarning && (
          <div className="mt-2 text-sm text-gray-500 flex items-center">
            <div className="animate-pulse mr-2">💭</div>
            Analyzing for MCT fidelity...
          </div>
        )}
      </div>

      {alert.type && showWarning && (
        <div className={`p-4 rounded-lg border ${getAlertStyles()}`}>
          <div className="flex items-start space-x-3">
            <span className="text-lg">{getAlertIcon()}</span>
            <div className="flex-1">
              <p className="font-medium mb-2">{alert.message}</p>

              {alert.suggestions.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">
                    {alert.type === 'process' ? 'Keep going with entries like:' : 'Try focusing on instead:'}
                  </p>
                  <ul className="space-y-1">
                    {alert.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <span className="mr-2">•</span>
                        <button
                          onClick={() => onTextChange(suggestion)}
                          className="text-left hover:underline focus:outline-none focus:underline"
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-2">MCT Process Focus Guidelines:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-800 mb-1">✅ Focus on PROCESS:</h5>
              <ul className="text-green-700 space-y-0.5">
                <li>• Duration of worry episodes</li>
                <li>• Attention control attempts</li>
                <li>• Postponement success/failure</li>
                <li>• Technique practice (ATT, DM, SAR)</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-red-800 mb-1">❌ Avoid CONTENT:</h5>
              <ul className="text-red-700 space-y-0.5">
                <li>• What you were worried about</li>
                <li>• Analyzing if worries are realistic</li>
                <li>• Problem-solving specific concerns</li>
                <li>• Seeking reassurance about fears</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FidelityWarning;