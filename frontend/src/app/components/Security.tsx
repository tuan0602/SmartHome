import { DoorOpen, DoorClosed, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSmartHome } from '../hooks/useSmartHome';

export function Security() {
  const { t } = useLanguage();
  
  // Lấy dữ liệu từ hook (
  const { 
    doorOpen, 
    doorLogs, 
    todayOpens, 
    lastActivity 
  } = useSmartHome();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2 font-bold">{t('security.title')}</h1>
        <p className="text-muted-foreground">{t('security.subtitle')}</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Door Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-2 p-8 rounded-3xl border transition-all duration-500 shadow-lg ${
            doorOpen 
            ? 'bg-red-500/5 border-red-500 shadow-red-500/10' 
            : 'bg-card border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{t('security.doorStatus')}</h2>
            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
              doorOpen ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500/20 text-green-500'
            }`}>
              {doorOpen ? 'Security Breach' : 'System Secured'}
            </div>
          </div>

          <div className="flex items-center gap-8 mb-8">
            <div
              className={`p-8 rounded-3xl transition-all duration-500 ${
                doorOpen ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-green-500/10 text-green-500'
              }`}
            >
              {doorOpen ? <DoorOpen size={64} /> : <DoorClosed size={64} />}
            </div>
            <div className="flex-1">
              <div className="text-5xl font-black mb-2 tracking-tight">
                {doorOpen ? t('home.open') : t('home.closed')}
              </div>
              <p className={`text-xl font-medium ${doorOpen ? 'text-red-500' : 'text-green-500'}`}>
                {doorOpen ? t('security.doorOpen') : t('security.doorClosed')}
              </p>
            </div>
          </div>

          {doorOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-red-500 text-white p-6 rounded-2xl shadow-xl shadow-red-500/20"
            >
              <AlertTriangle className="w-8 h-8 animate-bounce" />
              <div>
                <p className="font-bold text-lg">{t('security.alert')}</p>
                <p className="text-sm opacity-90 text-nowrap">door open !</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card p-8 rounded-3xl border border-border flex flex-col justify-center relative overflow-hidden"
          >
             <div className="absolute -right-4 -bottom-4 opacity-5 text-[#38BDF8]"><DoorOpen size={120}/></div>
            <p className="text-sm font-bold text-muted-foreground uppercase mb-4">{t('security.todayOpens')}</p>
            <div className="text-6xl font-black text-[#38BDF8] mb-2">{todayOpens}</div>
            <p className="text-xs font-medium text-muted-foreground italic">{t('security.doorActivity')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-8 rounded-3xl border border-border flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 text-[#38BDF8]"><Clock size={120}/></div>
            <p className="text-sm font-bold text-muted-foreground uppercase mb-4">{t('security.lastActivity')}</p>
            <div className="text-6xl font-black text-[#38BDF8] mb-2">{lastActivity}</div>
            <p className="text-xs font-medium text-muted-foreground italic">{t('security.recentEvent')}</p>
          </motion.div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {t('security.activityLog')} 
          <span className="text-xs bg-accent px-2 py-1 rounded-lg text-muted-foreground font-normal italic">Realtime Sync</span>
        </h2>

        <div className="bg-card p-2 rounded-3xl border border-border shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {doorLogs.length > 0 ? doorLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-accent/30 rounded-2xl hover:bg-accent/50 transition-all border border-transparent hover:border-border"
              >
                <div className={`p-3 rounded-xl ${log.status === 'open' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                  {log.status === 'open' ? <DoorOpen size={20} /> : <DoorClosed size={20} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{t(`security.${log.action}`)}</div>
                  <div className="flex items-center gap-2 opacity-60">
                    <Clock size={12} />
                    <p className="text-xs font-medium">{log.time}</p>
                  </div>
                </div>
              </motion.div>
            )) : (
                <div className="col-span-2 p-12 text-center text-muted-foreground italic">No activity recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}