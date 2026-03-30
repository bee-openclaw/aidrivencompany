import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  Sparkles,
  Megaphone,
  Shield,
  Scale,
  Wand2,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Command Center' },
  { to: '/graph', icon: Network, label: 'Company Graph' },
  { to: '/simulations', icon: Sparkles, label: 'Simulations' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/proof', icon: Shield, label: 'Proof' },
  { to: '/decisions', icon: Scale, label: 'Decisions' },
  { to: '/genesis', icon: Wand2, label: 'Genesis' },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Command Center',
  '/graph': 'Company Graph',
  '/simulations': 'Simulations',
  '/campaigns': 'Campaigns',
  '/proof': 'Proof',
  '/decisions': 'Decisions',
  '/genesis': 'Genesis',
  '/settings': 'Settings',
};

function Tooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-lg transition-all duration-150',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1',
      )}
    >
      {label}
    </div>
  );
}

export function Layout() {
  const { company, companies, switchCompany } = useCompany();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? '';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const companyInitial = company?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Rail */}
      <aside className="flex w-14 flex-col items-center border-r border-slate-800/60 bg-[#060a14]">
        {/* Company Avatar */}
        <div className="flex h-14 w-full items-center justify-center border-b border-slate-800/40">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-bold text-slate-950">
            {companyInitial}
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-1 flex-col items-center gap-1 py-3">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <div
              key={to}
              className="relative"
              onMouseEnter={() => setHoveredNav(to)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300',
                  )
                }
              >
                <Icon className="h-[18px] w-[18px]" />
              </NavLink>
              <Tooltip label={label} visible={hoveredNav === to} />
            </div>
          ))}
        </nav>

        {/* Settings at Bottom */}
        <div className="pb-3">
          <div
            className="relative"
            onMouseEnter={() => setHoveredNav('settings')}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300',
                )
              }
            >
              <Settings className="h-[18px] w-[18px]" />
            </NavLink>
            <Tooltip label="Settings" visible={hoveredNav === 'settings'} />
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-12 items-center justify-between border-b border-slate-800/40 bg-[#0a0f1a]/80 px-6 backdrop-blur-sm">
          <h1 className="text-sm font-semibold text-slate-200">{pageTitle}</h1>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-700/30 bg-slate-800/40 px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-slate-600/40 hover:bg-slate-800/60"
            >
              <span className="max-w-[180px] truncate">{company?.name ?? 'Select Company'}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-slate-500 transition-transform', selectorOpen && 'rotate-180')} />
            </button>
            {selectorOpen && companies.length > 1 && (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-slate-700/40 bg-slate-900 py-1 shadow-xl shadow-slate-950/50">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchCompany(c.id);
                      setSelectorOpen(false);
                    }}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-800/60',
                      c.id === company?.id ? 'text-amber-400 font-medium' : 'text-slate-300',
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="relative flex-1 overflow-auto bg-[#0a0f1a]">
          {/* Subtle radial gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,41,59,0.2)_0%,_transparent_70%)]" />
          <div className="relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
