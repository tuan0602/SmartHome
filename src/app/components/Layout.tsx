import { Outlet, NavLink } from 'react-router';
import { Home, Smartphone, Clock, Shield, Bell, Sun, Moon, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export function Layout() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/devices', icon: Smartphone, label: t('nav.devices') },
    { path: '/pomodoro', icon: Clock, label: t('nav.pomodoro') },
    { path: '/security', icon: Shield, label: t('nav.security') },
    { path: '/notifications', icon: Bell, label: t('nav.notifications') },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl">{t('common.smartHome')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('common.iotControl')}</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings & Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Theme & Language Controls */}
          <div className="space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-accent hover:bg-accent/80 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-[#FACC15]" />
              ) : (
                <Moon className="w-5 h-5 text-[#38BDF8]" />
              )}
              <span className="text-sm">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-accent hover:bg-accent/80 transition-colors"
            >
              <Languages className="w-5 h-5 text-[#38BDF8]" />
              <span className="text-sm">
                {language === 'en' ? 'Tiếng Việt' : 'English'}
              </span>
            </button>
          </div>

          <div className="text-xs text-muted-foreground pt-3 border-t border-border">
            <p>{t('common.version')}</p>
            <p className="mt-1">{t('common.copyright')}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}