import { useState } from 'react';
import { Bell, DoorOpen, Thermometer, Mail, MessageSquare, AlertTriangle, CheckCheck, Trash2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router';

export function Notifications() {
  const { t } = useLanguage();
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const navigate = useNavigate();
  
  // Lấy dữ liệu và hàm từ Hook 
  const { notifications, markAsRead, deleteNotification } = useNotifications();

  const handleNotificationClick = async (n: any) => {
    // Đánh dấu đã đọc trên Firebase
    if (!n.read) await markAsRead(n.id);

    // Điều hướng thông minh
    if (n.type === 'door' || n.type === 'alert') {
      navigate('/security'); 
    } else if (n.type === 'temperature') {
      navigate('/'); 
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'door': return <DoorOpen size={20} />;
      case 'temperature': return <Thermometer size={20} />;
      case 'alert': return <AlertTriangle size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getColor = (type: string, read: boolean) => {
    if (read) return 'bg-muted/50 text-muted-foreground';
    switch (type) {
      case 'door': return 'bg-sky-500/20 text-sky-500';
      case 'temperature': return 'bg-yellow-500/20 text-yellow-500';
      case 'alert': return 'bg-red-500/20 text-red-500';
      default: return 'bg-blue-500/20 text-blue-500';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header  */}
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">{t('notifications.title')}</h1>
          <p className="text-muted-foreground">{t('notifications.subtitle')}</p>
        </div>
        
        <button className="flex items-center gap-2 text-sm font-bold text-sky-500 hover:bg-sky-500/10 px-5 py-2.5 rounded-full transition-all border border-sky-500/20">
          <CheckCheck size={18} />
          {t('notifications.markAllRead')}
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Cột trái: Settings & Stats  */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="bg-card p-6 rounded-3xl border border-border shadow-xl"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Bell size={20} className="text-sky-500" />
              {t('notifications.channels')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Mail className="text-red-500" />
                  <span className="font-bold text-sm">Gmail</span>
                </div>
                <Switch checked={gmailEnabled} onCheckedChange={setGmailEnabled} />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-sky-400" />
                  <span className="font-bold text-sm">Telegram</span>
                </div>
                <Switch checked={telegramEnabled} onCheckedChange={setTelegramEnabled} />
              </div>
            </div>
          </motion.div>

          <div className="bg-card p-8 rounded-3xl border border-border shadow-md relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-5 text-sky-500 pointer-events-none">
                <Bell size={120}/>
             </div>
             <p className="text-xs font-black text-muted-foreground uppercase mb-2">{t('notifications.unread')}</p>
             <div className="text-6xl font-black text-sky-500 tracking-tighter">
               {notifications.filter(n => !n.read).length}
             </div>
             <p className="text-xs text-muted-foreground mt-2 italic">{t('notifications.newNotifications')}</p>
          </div>
        </div>

        {/* Cột phải*/}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <h2 className="font-bold text-muted-foreground px-2 mb-4 shrink-0">
            {t('notifications.recentAlerts')}
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar max-h-[calc(100vh-300px)]">
            <AnimatePresence mode='popLayout'>
              {notifications.length > 0 ? (
                notifications.map((n, i) => (
                  <motion.div
                    layout
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNotificationClick(n)}
                    className={`group relative p-5 rounded-3xl border transition-all duration-300 cursor-pointer ${
                      !n.read 
                      ? 'bg-card border-sky-500/30 shadow-md ring-1 ring-sky-500/10' 
                      : 'bg-muted/10 border-transparent opacity-60'
                    } hover:shadow-xl hover:border-sky-500/50 hover:bg-card`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${getColor(n.type, n.read)}`}>
                        {getIcon(n.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-bold text-base truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t(`notification.${n.title}`)}
                          </h3>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-md">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {t(`notification.${n.message}`)}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border">
                  <Bell size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground italic">{t('notifications.noNotifications')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}