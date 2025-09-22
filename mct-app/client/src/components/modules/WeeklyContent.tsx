import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  BeakerIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  BookOpenIcon,
  PlayCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { WeeklyContentData } from '../../data/weeklyContent';
import { getWeekResources } from '../../data/mctResources';

interface WeeklyContentProps {
  week: WeeklyContentData;
  isUnlocked: boolean;
  isCompleted: boolean;
  onStartExperiment?: (experiment: any) => void;
  onMarkComplete?: (weekNumber: number) => void;
}

export default function WeeklyContent({
  week,
  isUnlocked,
  isCompleted,
  onStartExperiment,
  onMarkComplete
}: WeeklyContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['content']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatContent = (content: string) => {
    // Split content into paragraphs and format markdown-like syntax
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        // Headers
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {paragraph.replace(/\*\*/g, '')}
          </h3>
        );
      } else if (paragraph.includes('**')) {
        // Bold text within paragraphs
        const parts = paragraph.split(/(\*\*.*?\*\*)/);
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.replace(/\*\*/g, '')}</strong>;
              }
              return part;
            })}
          </p>
        );
      } else if (paragraph.includes('- ')) {
        // Lists
        const items = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
        return (
          <ul key={index} className="list-disc pl-5 mb-4 space-y-1">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700">
                {item.replace(/^- /, '')}
              </li>
            ))}
          </ul>
        );
      } else if (paragraph.match(/^\d+\./)) {
        // Numbered lists
        const items = paragraph.split('\n').filter(line => line.trim().match(/^\d+\./));
        return (
          <ol key={index} className="list-decimal pl-5 mb-4 space-y-1">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      } else {
        // Regular paragraphs
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      }
    });
  };

  if (!isUnlocked) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-500">
          <LockClosedIcon className="h-6 w-6" />
          <div>
            <h3 className="font-medium">Week {week.weekNumber}: {week.title}</h3>
            <p className="text-sm">Complete previous weeks to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary-900">
              Week {week.weekNumber}: {week.title}
            </h2>
            <p className="text-primary-700 mt-1">
              {week.learningObjectives.length} learning objectives
            </p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      <CollapsibleSection
        title="Learning Objectives"
        icon={<LightBulbIcon className="h-5 w-5" />}
        isExpanded={expandedSections.has('objectives')}
        onToggle={() => toggleSection('objectives')}
      >
        <ul className="space-y-2">
          {week.learningObjectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Main Content */}
      <CollapsibleSection
        title="Module Content"
        icon={<div className="w-5 h-5 bg-primary-500 rounded text-white flex items-center justify-center text-xs font-bold">{week.weekNumber}</div>}
        isExpanded={expandedSections.has('content')}
        onToggle={() => toggleSection('content')}
      >
        <div className="prose prose-gray max-w-none">
          {formatContent(week.content)}
        </div>
      </CollapsibleSection>

      {/* Key Points */}
      <CollapsibleSection
        title="Key Points"
        icon={<div className="w-5 h-5 text-amber-600">💡</div>}
        isExpanded={expandedSections.has('keypoints')}
        onToggle={() => toggleSection('keypoints')}
      >
        <div className="grid gap-3">
          {week.keyPoints.map((point, index) => (
            <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800 font-medium">{point}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Try This Now */}
      <CollapsibleSection
        title="Try This Now"
        icon={<ClockIcon className="h-5 w-5 text-green-600" />}
        isExpanded={expandedSections.has('trythis')}
        onToggle={() => toggleSection('trythis')}
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Duration: {week.tryThisNow.duration}
            </span>
          </div>
          <p className="text-green-800 leading-relaxed">{week.tryThisNow.instruction}</p>
        </div>
      </CollapsibleSection>

      {/* Experiment */}
      {week.experiment && (
        <CollapsibleSection
          title="Weekly Experiment"
          icon={<BeakerIcon className="h-5 w-5 text-purple-600" />}
          isExpanded={expandedSections.has('experiment')}
          onToggle={() => toggleSection('experiment')}
        >
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">{week.experiment.title}</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-purple-800">Target Belief:</span>
                <p className="text-purple-700">{week.experiment.beliefTarget}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">Protocol:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {week.experiment.protocol.map((step, index) => (
                    <li key={index} className="text-purple-700 text-sm">{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-800">Your Prediction:</span>
                <p className="text-purple-700">{week.experiment.prediction}</p>
              </div>
              {onStartExperiment && (
                <button
                  onClick={() => onStartExperiment(week.experiment)}
                  className="w-full mt-3 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Experiment
                </button>
              )}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Week-specific Resources */}
      {getWeekResources(week.weekNumber) && (
        <CollapsibleSection
          title="Learning Resources"
          icon={<BookOpenIcon className="h-5 w-5 text-blue-600" />}
          isExpanded={expandedSections.has('resources')}
          onToggle={() => toggleSection('resources')}
        >
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              Supplementary materials for Week {week.weekNumber}
            </p>
            <div className="space-y-2">
              {getWeekResources(week.weekNumber)?.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <PlayCircleIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700 group-hover:text-blue-600">
                      {resource.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resource.duration && (
                      <span className="text-xs text-gray-500">{resource.duration}</span>
                    )}
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Pitfalls */}
      <CollapsibleSection
        title="Common Pitfalls & Redirections"
        icon={<ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />}
        isExpanded={expandedSections.has('pitfalls')}
        onToggle={() => toggleSection('pitfalls')}
      >
        <div className="space-y-3">
          {week.pitfalls.map((pitfall, index) => (
            <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-orange-900">Pitfall: {pitfall.pitfall}</p>
                  <p className="text-orange-800">
                    <span className="font-medium">Redirect:</span> "{pitfall.redirect}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Completion */}
      {!isCompleted && onMarkComplete && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => onMarkComplete(week.weekNumber)}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Mark Week {week.weekNumber} Complete
          </button>
        </div>
      )}
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}