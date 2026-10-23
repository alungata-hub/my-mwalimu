import { useState, type ReactNode } from 'react';
import { Menu, X, GraduationCap, Bell, Search, ChevronRight, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/curriculum';
import { navigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';

interface LayoutProps {
  current: string;
  children: ReactNode;
}

export function Layout({ current, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const initials = (user?.email ?? 'S').charAt(0).toUpperCase();

  const groups: Array<{ label: string; items: typeof NAV_ITEMS }> = [
    { label: 'Overview', items: NAV_ITEMS.filter((i) => i.group === 'main') },
    { label: 'AZ-900 Domains', items: NAV_ITEMS.filter((i) => i.group === 'domains') },
    { label: 'Tools', items: NAV_ITEMS.filter((i) => i.group === 'tools') },
  ];

  const handleNav = (route: string) => {
    navigate(route);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-ink-200
                    flex flex-col transition-transform duration-200 lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-ink-200 shrink-0">
          <button
            onClick={() => handleNav('#/dashboard')}
            className="flex items-center gap-2.5 group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-left">
              <span className="block font-display font-bold text-ink-900 leading-tight">
                My Mwalimu
              </span>
              <span className="block text-[11px] text-ink-500 font-medium">
                AZ-900 Study Companion
              </span>
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-ink-500 hover:bg-ink-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = current === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNav(item.route)}
                        className={`nav-link w-full ${active ? 'nav-link-active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-ink-200 shrink-0">
          <div className="card bg-primary-50 border-primary-100 p-4">
            <p className="text-sm font-semibold text-primary-800">Exam target</p>
            <p className="mt-1 text-xs text-primary-700/80">
              Microsoft Certified: Azure Fundamentals (AZ-900)
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-primary-200 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-primary-600" />
              </div>
              <span className="text-[11px] font-semibold text-primary-700">33%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-ink-200">
          <div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="search"
                  placeholder="Search topics, terms…"
                  className="input pl-9 py-2 bg-ink-50 border-ink-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                className="relative p-2.5 rounded-lg text-ink-600 hover:bg-ink-100"
                aria-label="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-500 ring-2 ring-white" />
              </button>
              <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-ink-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-sm font-semibold text-ink-800 truncate max-w-[140px]">
                    {user?.email ?? 'Student'}
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
