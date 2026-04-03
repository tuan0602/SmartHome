import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

type Translations = {
  [key: string]: {
    en: string;
    vi: string;
  };
};

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', vi: 'Trang chủ' },
  'nav.devices': { en: 'Devices', vi: 'Thiết bị' },
  'nav.pomodoro': { en: 'Pomodoro', vi: 'Pomodoro' },
  'nav.security': { en: 'Security', vi: 'Bảo mật' },
  'nav.notifications': { en: 'Notifications', vi: 'Thông báo' },
  
  // Home Dashboard
  'home.title': { en: 'Home Dashboard', vi: 'Bảng điều khiển' },
  'home.subtitle': { en: 'Welcome back! Here\'s your home overview', vi: 'Chào mừng trở lại! Tổng quan nhà của bạn' },
  'home.temperature': { en: 'Temperature', vi: 'Nhiệt độ' },
  'home.humidity': { en: 'Humidity', vi: 'Độ ẩm' },
  'home.activeLights': { en: 'Active Lights', vi: 'Đèn đang bật' },
  'home.doorStatus': { en: 'Door Status', vi: 'Trạng thái cửa' },
  'home.frontDoor': { en: 'Front door', vi: 'Cửa chính' },
  'home.quickControls': { en: 'Quick Controls', vi: 'Điều khiển nhanh' },
  'home.security': { en: 'Security', vi: 'Bảo mật' },
  'home.livingRoomLight': { en: 'Living Room Light', vi: 'Đèn phòng khách' },
  'home.ceilingFan': { en: 'Ceiling Fan', vi: 'Quạt trần' },
  'home.frontDoorName': { en: 'Front Door', vi: 'Cửa chính' },
  'home.on': { en: 'On', vi: 'Bật' },
  'home.off': { en: 'Off', vi: 'Tắt' },
  'home.allOff': { en: 'All off', vi: 'Tất cả tắt' },
  'home.open': { en: 'Open', vi: 'Mở' },
  'home.closed': { en: 'Closed', vi: 'Đóng' },
  'home.toggle': { en: 'Toggle', vi: 'Chuyển đổi' },
  'home.updatedNow': { en: 'Updated just now', vi: 'Vừa cập nhật' },
  'home.alert': { en: 'Alert: Front door has been open for extended period', vi: 'Cảnh báo: Cửa chính đã mở quá lâu' },
  
  // Devices
  'devices.title': { en: 'Devices Control', vi: 'Điều khiển thiết bị' },
  'devices.subtitle': { en: 'Manage and configure your smart devices', vi: 'Quản lý và cấu hình thiết bị thông minh' },
  'devices.lights': { en: 'Lights', vi: 'Đèn' },
  'devices.fan': { en: 'Fan', vi: 'Quạt' },
  'devices.livingRoom': { en: 'Living Room', vi: 'Phòng khách' },
  'devices.ceilingFan': { en: 'Ceiling Fan', vi: 'Quạt trần' },
  'devices.mode': { en: 'Mode', vi: 'Chế độ' },
  'devices.manual': { en: 'Manual', vi: 'Thủ công' },
  'devices.auto': { en: 'Auto', vi: 'Tự động' },
  'devices.autoMode': { en: 'Auto mode: 23:00 – 06:00', vi: 'Chế độ tự động: 23:00 – 06:00' },
  'devices.tempThreshold': { en: 'Temperature Threshold', vi: 'Ngưỡng nhiệt độ' },
  'devices.fanAutoDesc': { en: 'Fan will turn on automatically when temperature exceeds', vi: 'Quạt sẽ tự động bật khi nhiệt độ vượt quá' },
  
  // Pomodoro
  'pomodoro.title': { en: 'Pomodoro Timer', vi: 'Hẹn giờ Pomodoro' },
  'pomodoro.subtitle': { en: 'Stay focused and productive', vi: 'Tập trung và làm việc hiệu quả' },
  'pomodoro.focus': { en: 'Focus', vi: 'Tập trung' },
  'pomodoro.break': { en: 'Break', vi: 'Nghỉ ngơi' },
  'pomodoro.stayFocused': { en: 'Stay focused', vi: 'Tập trung làm việc' },
  'pomodoro.takeBreak': { en: 'Take a break', vi: 'Nghỉ ngơi một chút' },
  'pomodoro.currentSession': { en: 'Current Session', vi: 'Phiên hiện tại' },
  'pomodoro.focusSession': { en: '25 minutes focus session', vi: 'Phiên tập trung 25 phút' },
  'pomodoro.breakSession': { en: '5 minutes break session', vi: 'Phiên nghỉ 5 phút' },
  'pomodoro.status': { en: 'Status', vi: 'Trạng thái' },
  'pomodoro.running': { en: 'Running', vi: 'Đang chạy' },
  'pomodoro.paused': { en: 'Paused', vi: 'Đã tạm dừng' },
  'pomodoro.start': { en: 'Start Session', vi: 'Bắt đầu' },
  'pomodoro.pause': { en: 'Pause Session', vi: 'Tạm dừng' },
  'pomodoro.reset': { en: 'Reset Timer', vi: 'Đặt lại' },
  
  // Security
  'security.title': { en: 'Security', vi: 'Bảo mật' },
  'security.subtitle': { en: 'Monitor your home security and door activity', vi: 'Giám sát bảo mật và hoạt động cửa' },
  'security.doorStatus': { en: 'Front Door Status', vi: 'Trạng thái cửa chính' },
  'security.toggleDoor': { en: 'Toggle Door', vi: 'Chuyển đổi cửa' },
  'security.doorOpen': { en: 'Door is currently open', vi: 'Cửa đang mở' },
  'security.doorClosed': { en: 'Door is secured', vi: 'Cửa đã khóa' },
  'security.alert': { en: 'Alert: Front door has been open for extended period', vi: 'Cảnh báo: Cửa chính đã mở quá lâu' },
  'security.todayOpens': { en: 'Today\'s Opens', vi: 'Số lần mở hôm nay' },
  'security.doorActivity': { en: 'Door activity count', vi: 'Số lần hoạt động' },
  'security.lastActivity': { en: 'Last Activity', vi: 'Hoạt động cuối' },
  'security.recentEvent': { en: 'Most recent event', vi: 'Sự kiện gần nhất' },
  'security.activityLog': { en: 'Activity Log', vi: 'Nhật ký hoạt động' },
  'security.doorOpened': { en: 'Door opened', vi: 'Cửa đã mở' },
  // 'security.doorClosed': { en: 'Door closed', vi: 'Cửa đã đóng' },
  
  // Notifications
  'notifications.title': { en: 'Notifications', vi: 'Thông báo' },
  'notifications.subtitle': { en: 'Stay updated with your home alerts and activity', vi: 'Cập nhật cảnh báo và hoạt động' },
  'notifications.channels': { en: 'Notification Channels', vi: 'Kênh thông báo' },
  'notifications.enabled': { en: 'Enabled', vi: 'Đã bật' },
  'notifications.disabled': { en: 'Disabled', vi: 'Đã tắt' },
  'notifications.unread': { en: 'Unread', vi: 'Chưa đọc' },
  'notifications.newNotifications': { en: 'New notifications', vi: 'Thông báo mới' },
  'notifications.totalToday': { en: 'Total Today', vi: 'Tổng hôm nay' },
  'notifications.allNotifications': { en: 'All notifications', vi: 'Tất cả thông báo' },
  'notifications.recentAlerts': { en: 'Recent Alerts', vi: 'Cảnh báo gần đây' },
  'notifications.markAllRead': { en: 'Mark all as read', vi: 'Đánh dấu đã đọc' },
  
  // Notification items
  'notification.doorOpened': { en: 'Door Opened', vi: 'Cửa đã mở' },
  'notification.doorClosed': { en: 'Door Closed', vi: 'Cửa đã đóng' },
  'notification.tempAlert': { en: 'Temperature Alert', vi: 'Cảnh báo nhiệt độ' },
  'notification.securityAlert': { en: 'Security Alert', vi: 'Cảnh báo bảo mật' },
  'notification.tempNormal': { en: 'Temperature Normal', vi: 'Nhiệt độ bình thường' },
  'notification.doorOpenedAt': { en: 'Front door was opened at', vi: 'Cửa chính đã mở lúc' },
  'notification.doorClosedAt': { en: 'Front door was closed at', vi: 'Cửa chính đã đóng lúc' },
  'notification.tempExceeded': { en: 'Temperature exceeded threshold', vi: 'Nhiệt độ vượt ngưỡng' },
  'notification.doorOpenTooLong': { en: 'Door was open for more than 10 minutes', vi: 'Cửa mở quá 10 phút' },
  'notification.tempReturned': { en: 'Temperature returned to normal', vi: 'Nhiệt độ trở lại bình thường' },
  
  // Common
  'common.smartHome': { en: 'Smart Home', vi: 'Nhà thông minh' },
  'common.iotControl': { en: 'IoT Control Panel', vi: 'Bảng điều khiển IoT' },
  'common.version': { en: 'Smart Home v1.0', vi: 'Nhà thông minh v1.0' },
  'common.copyright': { en: '© 2026 IoT Dashboard', vi: '© 2026 Bảng điều khiển IoT' },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
