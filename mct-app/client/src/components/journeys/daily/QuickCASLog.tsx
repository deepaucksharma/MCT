import { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, CheckIcon } from '@heroicons/react/24/outline';

interface QuickCASLogProps {
  onComplete: (timeSpent: number) => void;
}

interface CASEntry {
  worry_minutes: number;
  rumination_minutes: number;
  monitoring_count: number;
  checking_count: number;
  reassurance_count: number;
  avoidance_count: number;
}

export default function QuickCASLog({ onComplete }: QuickCASLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [entry, setEntry] = useState<CASEntry>({
    worry_minutes: 0,
    rumination_minutes: 0,
    monitoring_count: 0,
    checking_count: 0,
    reassurance_count: 0,
    avoidance_count: 0
  });

  const openLog = () => {
    setIsOpen(true);
    setStartTime(Date.now());
  };

  const updateEntry = (key: keyof CASEntry, value: number) => {
    setEntry(prev => ({ ...prev, [key]: value }));
  };

  const saveEntry = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(timeSpent);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={openLog}
        className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
      >
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">Quick CAS Log</h3>
            <p className="text-sm text-gray-600">Track today's patterns (2 min)</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
    >
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Quick CAS Log
          </h3>
          <p className="text-sm text-gray-600">
            Briefly note your patterns today (no judgment, just awareness)
          </p>
        </div>

        <div className="space-y-4">
          {/* Time-based entries */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Time spent today:</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Worry (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={entry.worry_minutes}
                  onChange={(e) => updateEntry('worry_minutes', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rumination (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={entry.rumination_minutes}
                  onChange={(e) => updateEntry('rumination_minutes', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Count-based entries */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Number of times today:</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Checking behaviors</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.checking_count}
                  onChange={(e) => updateEntry('checking_count', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Threat monitoring</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.monitoring_count}
                  onChange={(e) => updateEntry('monitoring_count', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Reassurance seeking</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.reassurance_count}
                  onChange={(e) => updateEntry('reassurance_count', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Avoidance behaviors</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={entry.avoidance_count}
                  onChange={(e) => updateEntry('avoidance_count', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-xs">
            <strong>Remember:</strong> These numbers are estimates. The goal is awareness, not precision.
            Notice patterns without judgment.
          </p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveEntry}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <CheckIcon className="w-4 h-4 mr-1" />
            Save Log
          </button>
        </div>
      </div>
    </motion.div>
  );
}