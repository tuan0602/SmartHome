import { useState } from 'react';
import { Bell, DoorOpen, Thermometer, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'door' | 'temperature' | 'alert';
  read: boolean;
};

export function Notifications() {
  const { t } = useLanguage();
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'doorOpened',
      message: 'doorOpenedAt',
      time: '2m ago',
      type: 'door',
      read: false,
    },
    {
      id: 2,
      title: 'tempAlert',
      message: 'tempExceeded',
      time: '15m ago',
      type: 'temperature',
      read: false,
    },
    {
      id: 3,
      title: 'doorClosed',
      message: 'doorClosedAt',
      time: '3h ago',
      type: 'door',
      read: true,
    },
    {
      id: 4,
      title: 'securityAlert',
      message: 'doorOpenTooLong',
      time: '5h ago',
      type: 'alert',
      read: true,
    },
    {
      id: 5,
      title: 'tempNormal',
      message: 'tempReturned',
      time: '6h ago',
      type: 'temperature',
      read: true,
    },
    {
      id: 6,
      title: 'doorOpened',
      message: 'doorOpenedAt',
      time: '8h ago',
      type: 'door',
      read: true,
    },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'door':
        return <DoorOpen className="w-5 h-5" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'door':
        return 'bg-[#38BDF8]/20 text-[#38BDF8]';
      case 'temperature':
        return 'bg-[#FACC15]/20 text-[#FACC15]';
      case 'alert':
        return 'bg-[#EF4444]/20 text-[#EF4444]';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{t('notifications.title')}</h1>
        <p className="text-muted-foreground">{t('notifications.subtitle')}</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Notification Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-lg space-y-6"
        >
          <h2 className="text-xl">{t('notifications.channels')}</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#EF4444]/20 rounded-xl">
                <Mail className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <div className="text-sm">Gmail</div>
                <p className="text-xs text-muted-foreground">
                  {gmailEnabled ? t('notifications.enabled') : t('notifications.disabled')}
                </p>
              </div>
            </div>
            <Switch checked={gmailEnabled} onCheckedChange={setGmailEnabled} />
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#38BDF8]/20 rounded-xl">
                <MessageSquare className="w-6 h-6 text-[#38BDF8]" />
              </div>
              <div>
                <div className="text-sm">Telegram</div>
                <p className="text-xs text-muted-foreground">
                  {telegramEnabled ? t('notifications.enabled') : t('notifications.disabled')}
                </p>
              </div>
            </div>
            <Switch checked={telegramEnabled} onCheckedChange={setTelegramEnabled} />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <p className="text-sm text-muted-foreground mb-3">{t('notifications.unread')}</p>
          <div className="text-5xl text-[#38BDF8] mb-2">
            {notifications.filter((n) => !n.read).length}
          </div>
          <p className="text-xs text-muted-foreground">{t('notifications.newNotifications')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <p className="text-sm text-muted-foreground mb-3">{t('notifications.totalToday')}</p>
          <div className="text-5xl text-[#38BDF8] mb-2">{notifications.length}</div>
          <p className="text-xs text-muted-foreground">{t('notifications.allNotifications')}</p>
        </motion.div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">{t('notifications.recentAlerts')}</h2>
          <button className="text-sm text-[#38BDF8] hover:text-[#38BDF8]/80 transition-colors px-4 py-2 rounded-lg hover:bg-accent">
            {t('notifications.markAllRead')}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className={`bg-card p-6 rounded-2xl border border-border shadow-lg hover:border-[#38BDF8]/50 transition-all cursor-pointer ${
                !notification.read ? 'ring-1 ring-[#38BDF8]/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t(`notification.${notification.title}`)}</span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-[#38BDF8] rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(`notification.${notification.message}`)} {notification.title === 'doorOpened' || notification.title === 'doorClosed' ? '22:15' : notification.title === 'tempAlert' ? '(32°C)' : notification.title === 'tempNormal' ? '(28°C)' : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}