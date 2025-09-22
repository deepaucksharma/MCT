import { motion } from 'framer-motion';
import { ChevronLeftIcon, ClockIcon, BellIcon } from '@heroicons/react/24/outline';
import { UserSettings } from '../../../types';

interface DailyReminderSetupProps {
  settings: Partial<UserSettings>;
  onUpdate: (settings: Partial<UserSettings>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function DailyReminderSetup({
  settings,
  onUpdate,
  onNext,
  onPrevious
}: DailyReminderSetupProps) {
  const updateSetting = (key: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const updateDMTime = (index: number, time: string) => {
    const newTimes = [...(settings.dm_reminder_times || ['08:00', '13:00', '18:00'])];
    newTimes[index] = time;
    updateSetting('dm_reminder_times', newTimes);
  };

  const timeSlots = [
    { label: 'Morning', description: 'Brief mindfulness check-in', key: 0 },
    { label: 'Midday', description: 'CAS pattern awareness', key: 1 },
    { label: 'Evening', description: 'Day reflection', key: 2 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set Your Daily Reminders
        </h2>
        <p className="text-gray-600">
          Consistency is key. Let's set up your practice schedule (you can change these later)
        </p>
      </div>

      <div className="space-y-6">
        {/* ATT Session Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">ATT Session</h3>
              <p className="text-sm text-gray-600">12-15 minutes of attention training</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred time
              </label>
              <input
                type="time"
                value={settings.att_reminder_time || '20:00'}
                onChange={(e) => updateSetting('att_reminder_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <div className="text-xs text-gray-500">
                <p>📌 Best practice:</p>
                <p>Evening sessions often work best for building habits</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DM Practice Times */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">🧘</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Detached Mindfulness Check-ins</h3>
              <p className="text-sm text-gray-600">3 brief moments throughout your day (2-3 minutes each)</p>
            </div>
          </div>

          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div key={slot.key} className="grid grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {slot.label}
                  </label>
                  <p className="text-xs text-gray-500">{slot.description}</p>
                </div>
                <input
                  type="time"
                  value={settings.dm_reminder_times?.[index] || ['08:00', '13:00', '18:00'][index]}
                  onChange={(e) => updateDMTime(index, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="text-xs text-gray-500">
                  {index === 0 && "Start your day mindfully"}
                  {index === 1 && "Mid-day pattern check"}
                  {index === 2 && "Evening wind-down"}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Postponement Slot */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">⏰</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Worry Postponement Slot</h3>
              <p className="text-sm text-gray-600">15-minute window for processing postponed worries</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start time
              </label>
              <input
                type="time"
                value={settings.postponement_slot_start || '18:30'}
                onChange={(e) => updateSetting('postponement_slot_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <select
                value={settings.postponement_slot_duration || 15}
                onChange={(e) => updateSetting('postponement_slot_duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BellIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Gentle Reminders</h3>
                <p className="text-sm text-gray-600">Helpful nudges to support your practice</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications_enabled ?? true}
                onChange={(e) => updateSetting('notifications_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </motion.div>
      </div>

      {/* Daily Schedule Summary */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Your Daily Schedule</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Morning DM:</span>
            <span className="font-medium">{settings.dm_reminder_times?.[0] || '08:00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Midday DM:</span>
            <span className="font-medium">{settings.dm_reminder_times?.[1] || '13:00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Evening DM:</span>
            <span className="font-medium">{settings.dm_reminder_times?.[2] || '18:00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Postponement slot:</span>
            <span className="font-medium">{settings.postponement_slot_start || '18:30'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ATT session:</span>
            <span className="font-medium">{settings.att_reminder_time || '20:00'}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-primary-600 font-medium">
              <span>Total daily time:</span>
              <span>≤20 minutes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );
}