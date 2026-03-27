import { useState } from 'react';
import { DoorOpen, DoorClosed, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type ActivityLog = {
  id: number;
  action: string;
  time: string;
  type: 'open' | 'closed';
};

export function Security() {
  const { t } = useLanguage();
  const [doorOpen, setDoorOpen] = useState(false);
  const [activityLog] = useState<ActivityLog[]>([
    { id: 1, action: 'doorOpened', time: '22:15', type: 'open' },
    { id: 2, action: 'doorClosed', time: '22:10', type: 'closed' },
    { id: 3, action: 'doorOpened', time: '18:45', type: 'open' },
    { id: 4, action: 'doorClosed', time: '18:30', type: 'closed' },
    { id: 5, action: 'doorOpened', time: '14:20', type: 'open' },
    { id: 6, action: 'doorClosed', time: '14:05', type: 'closed' },
    { id: 7, action: 'doorOpened', time: '09:30', type: 'open' },
    { id: 8, action: 'doorClosed', time: '09:15', type: 'closed' },
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{t('security.title')}</h1>
        <p className="text-muted-foreground">{t('security.subtitle')}</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Door Status Card - Larger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">{t('security.doorStatus')}</h2>
            <button
              onClick={() => setDoorOpen(!doorOpen)}
              className="px-6 py-3 bg-accent hover:bg-accent/80 rounded-xl transition-colors"
            >
              {t('security.toggleDoor')}
            </button>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div
              className={`p-6 rounded-2xl transition-colors ${
                doorOpen ? 'bg-[#EF4444]/20' : 'bg-green-500/20'
              }`}
            >
              {doorOpen ? (
                <DoorOpen className="w-16 h-16 text-[#EF4444]" />
              ) : (
                <DoorClosed className="w-16 h-16 text-green-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-4xl mb-2">
                {doorOpen ? t('home.open') : t('home.closed')}
              </div>
              <p className={`text-lg ${doorOpen ? 'text-[#EF4444]' : 'text-green-500'}`}>
                {doorOpen ? t('security.doorOpen') : t('security.doorClosed')}
              </p>
            </div>
          </div>

          {doorOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-4 bg-[#EF4444]/10 border border-[#EF4444]/20 p-6 rounded-xl"
            >
              <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              <p className="text-[#EF4444]">
                {t('security.alert')}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-6 rounded-2xl border border-border"
          >
            <p className="text-sm text-muted-foreground mb-3">{t('security.todayOpens')}</p>
            <div className="text-5xl text-[#38BDF8] mb-2">3</div>
            <p className="text-xs text-muted-foreground">{t('security.doorActivity')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-6 rounded-2xl border border-border"
          >
            <p className="text-sm text-muted-foreground mb-3">{t('security.lastActivity')}</p>
            <div className="text-5xl text-[#38BDF8] mb-2">22:15</div>
            <p className="text-xs text-muted-foreground">{t('security.recentEvent')}</p>
          </motion.div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-4">
        <h2 className="text-2xl">{t('security.activityLog')}</h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activityLog.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-4 p-5 bg-accent rounded-xl hover:bg-accent/80 transition-colors"
              >
                <div
                  className={`p-3 rounded-lg ${
                    log.type === 'open' ? 'bg-[#EF4444]/20' : 'bg-green-500/20'
                  }`}
                >
                  {log.type === 'open' ? (
                    <DoorOpen className="w-5 h-5 text-[#EF4444]" />
                  ) : (
                    <DoorClosed className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-1">{t(`security.${log.action}`)}</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{log.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}