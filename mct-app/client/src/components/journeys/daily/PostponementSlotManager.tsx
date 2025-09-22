import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CheckIcon, PlayIcon } from '@heroicons/react/24/outline';
import { UserSettings } from '../../../types';

interface PostponementSlotManagerProps {
  settings: UserSettings | null;
  onUse: (timeSpent: number) => void;
}

export default function PostponementSlotManager({ settings, onUse }: PostponementSlotManagerProps) {
  const [isSlotActive, setIsSlotActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [postponedWorries, setPostponedWorries] = useState<string[]>([]);
  const [currentWorry, setCurrentWorry] = useState('');

  const slotDuration = (settings?.postponement_slot_duration || 15) * 60; // Convert to seconds

  useEffect(() => {
    if (isSlotActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endSlot();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSlotActive, timeRemaining]);

  const isWithinSlotTime = () => {
    if (!settings?.postponement_slot_start) return false;

    const now = new Date();
    const [slotHour, slotMinute] = settings.postponement_slot_start.split(':').map(Number);
    const slotStart = new Date();
    slotStart.setHours(slotHour, slotMinute, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 1000);

    return now >= slotStart && now <= slotEnd;
  };

  const startSlot = () => {
    setIsSlotActive(true);
    setStartTime(Date.now());
    setTimeRemaining(slotDuration);
    setIsOpen(true);
  };

  const endSlot = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    setIsSlotActive(false);
    setIsOpen(false);
    onUse(timeSpent);
  };

  const addWorry = () => {
    if (currentWorry.trim()) {
      setPostponedWorries(prev => [...prev, currentWorry.trim()]);
      setCurrentWorry('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => isWithinSlotTime() ? startSlot() : setIsOpen(true)}
        className={`p-4 bg-white border rounded-lg transition-colors text-left ${
          isWithinSlotTime()
            ? 'border-orange-400 bg-orange-50 hover:bg-orange-100'
            : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          <ClockIcon className={`w-6 h-6 ${isWithinSlotTime() ? 'text-orange-600' : 'text-gray-600'}`} />
          <div>
            <h3 className={`font-medium ${isWithinSlotTime() ? 'text-orange-900' : 'text-gray-900'}`}>
              Postponement Slot
            </h3>
            <p className={`text-sm ${isWithinSlotTime() ? 'text-orange-700' : 'text-gray-600'}`}>
              {isWithinSlotTime() ? 'Active now!' : `Available at ${settings?.postponement_slot_start || '18:30'}`}
            </p>
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              Worry Postponement Slot
            </h3>
            {isSlotActive && (
              <div className="text-lg font-bold text-orange-600">
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {isSlotActive
              ? 'Process your postponed worries now'
              : 'Schedule your worry time or process postponed thoughts'
            }
          </p>
        </div>

        {!isSlotActive && !isWithinSlotTime() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Your scheduled slot is at {settings?.postponement_slot_start || '18:30'}.
              You can start it now if you have postponed worries to process.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Current worries to process */}
          {isSlotActive && (
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-2">
                Add worries to process:
              </h4>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={currentWorry}
                  onChange={(e) => setCurrentWorry(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addWorry()}
                  placeholder="What's on your mind?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={addWorry}
                  className="px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {postponedWorries.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h5 className="text-xs font-medium text-gray-700">To process:</h5>
                  {postponedWorries.map((worry, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                      {worry}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 text-sm mb-1">
              {isSlotActive ? 'During Your Slot:' : 'How it Works:'}
            </h4>
            <ul className="text-amber-800 text-xs space-y-1">
              {isSlotActive ? (
                <>
                  <li>• Work through each worry briefly</li>
                  <li>• Ask: "Is this productive thinking?"</li>
                  <li>• For each worry: accept, plan action, or let go</li>
                  <li>• When time's up, stop - even if incomplete</li>
                </>
              ) : (
                <>
                  <li>• Schedule daily 15-minute worry window</li>
                  <li>• Postpone worries throughout the day to this slot</li>
                  <li>• Process worries systematically during slot time</li>
                  <li>• Stop when time is up, regardless of completion</li>
                </>
              )}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            {!isSlotActive ? (
              <>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={startSlot}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  <PlayIcon className="w-4 h-4 mr-1" />
                  Start Slot
                </button>
              </>
            ) : (
              <button
                onClick={endSlot}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                End Slot
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}