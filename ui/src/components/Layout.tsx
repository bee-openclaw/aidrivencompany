import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  FlaskConical,
  Megaphone,
  Award,
  Scale,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/graph', icon: GitBranch, label: 'Company Graph' },
  { to: '/simulations', icon: FlaskConical, label: 'Simulations' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/proof', icon: Award, label: 'Proof' },
  { to: '/decisions', icon: Scale, label: 'Decisions' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const { company, companies, switchCompany } = useCompany();
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-60 flex-col border-r border-gray-800 bg-gray-950">
        <div className="relative border-b border-gray-800 p-4">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="flex w-full items-center justify-between rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800"
          >
            <span className="truncate">{company?.name ?? 'Select Company'}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
          </button>
          {selectorOpen && companies.length > 1 && (
            <div className="absolute left-4 right-4 top-full z-50 mt-1 rounded-lg border border-gray-800 bg-gray-900 py-1 shadow-xl">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    switchCompany(c.id);
                    setSelectorOpen(false);
                  }}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-sm hover:bg-gray-800',
                    c.id === company?.id ? 'text-primary-400 font-medium' : 'text-gray-300',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600/10 text-primary-400'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-100',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <p className="text-xs text-gray-500">AIDrivenCompany v0.1</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
}
