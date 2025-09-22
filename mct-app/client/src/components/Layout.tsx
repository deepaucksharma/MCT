import { Outlet, NavLink } from 'react-router-dom';
import {
  CalendarDaysIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Today', href: '/today', icon: CalendarDaysIcon },
  { name: 'Program', href: '/program', icon: AcademicCapIcon },
  { name: 'Log', href: '/log', icon: ClipboardDocumentListIcon },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon },
  { name: 'More', href: '/more', icon: EllipsisVerticalIcon },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Pocket Guide to a Calmer Mind
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200">
          <div className="flex justify-around">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center py-3 px-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                <item.icon className="h-6 w-6 mb-1" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}