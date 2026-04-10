import { motion } from 'framer-motion'; // Đảm bảo dùng framer-motion thống nhất
import { Thermometer, Droplets, Lightbulb, Fan, DoorOpen, DoorClosed, AlertTriangle } from 'lucide-react';
import { Switch } from './ui/switch';
import { useLanguage } from '../contexts/LanguageContext';
import { useSmartHome } from '../hooks/useSmartHome'; 

export function HomeDashboard() {
  const { t } = useLanguage();

  // Lấy toàn bộ dữ liệu từ hook dùng chung
  const { sensorData, lightOn, fanOn, doorOpen, handleDeviceControl } = useSmartHome();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2 font-bold">{t('home.title')}</h1>
        <p className="text-muted-foreground">{t('home.subtitle')}</p>
      </div>

      {/* Temperature & Humidity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Nhiệt độ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-3xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#38BDF8]/20 rounded-xl">
              <Thermometer className="w-6 h-6 text-[#38BDF8]" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase">{t('home.temperature')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-black">{sensorData.temperature}°C</div>
            <p className="text-xs text-muted-foreground italic">{t('home.updatedNow')}</p>
          </div>
        </motion.div>

        {/* Card Độ ẩm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-3xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#38BDF8]/20 rounded-xl">
              <Droplets className="w-6 h-6 text-[#38BDF8]" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase">{t('home.humidity')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-black">{sensorData.humidity}%</div>
            <p className="text-xs text-muted-foreground italic">{t('home.updatedNow')}</p>
          </div>
        </motion.div>

        {/* Card Đèn đang bật */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-3xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl transition-colors ${lightOn ? 'bg-[#FACC15]/20' : 'bg-muted'}`}>
              <Lightbulb className={`w-6 h-6 transition-colors ${lightOn ? 'text-[#FACC15]' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase">{t('home.activeLights')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-5xl font-black">{lightOn ? '1' : '0'}</div>
            <p className="text-xs text-muted-foreground">{lightOn ? t('home.on') : t('home.allOff')}</p>
          </div>
        </motion.div>

        {/* Card Trạng thái cửa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-card p-6 rounded-3xl border transition-all duration-500 shadow-lg ${
            doorOpen ? 'border-[#EF4444] bg-[#EF4444]/5' : 'border-border'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl transition-colors ${doorOpen ? 'bg-[#EF4444]/20' : 'bg-green-500/20'}`}>
              {doorOpen ? (
                <DoorOpen className="w-6 h-6 text-[#EF4444]" />
              ) : (
                <DoorClosed className="w-6 h-6 text-green-500" />
              )}
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase">{t('home.doorStatus')}</span>
          </div>
          <div className="space-y-1">
            <div className={`text-5xl font-black ${doorOpen ? 'text-[#EF4444]' : 'text-green-500'}`}>
              {doorOpen ? t('home.open') : t('home.closed')}
            </div>
            <p className="text-xs text-muted-foreground">{t('home.frontDoor')}</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">{t('home.quickControls')}</h2>
          
          {/* Điều khiển Đèn */}
          <motion.div
            className="bg-card p-6 rounded-3xl border border-border shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${lightOn ? 'bg-[#FACC15]/20' : 'bg-muted'}`}>
                  <Lightbulb className={`w-6 h-6 transition-colors ${lightOn ? 'text-[#FACC15]' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="text-lg font-bold">{t('home.livingRoomLight')}</div>
                  <p className="text-sm text-muted-foreground">{lightOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch checked={lightOn} onCheckedChange={() => handleDeviceControl('light', lightOn)} />
            </div>
          </motion.div>

          {/* Điều khiển Quạt */}
          <motion.div
            className="bg-card p-6 rounded-3xl border border-border shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${fanOn ? 'bg-[#38BDF8]/20' : 'bg-muted'}`}>
                  <Fan className={`w-6 h-6 transition-all ${fanOn ? 'text-[#38BDF8] animate-spin' : 'text-muted-foreground'}`} style={{ animationDuration: '2s' }} />
                </div>
                <div>
                  <div className="text-lg font-bold">{t('home.ceilingFan')}</div>
                  <p className="text-sm text-muted-foreground">{fanOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch checked={fanOn} onCheckedChange={() => handleDeviceControl('fan', fanOn)} />
            </div>
          </motion.div>
        </div>

        {/* Security Overview */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">{t('home.security')}</h2>
          <motion.div
            className={`bg-card p-6 rounded-3xl border transition-all duration-500 shadow-lg h-full relative overflow-hidden ${
              doorOpen ? 'border-[#EF4444] bg-[#EF4444]/5' : 'border-border'
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl transition-colors ${doorOpen ? 'bg-[#EF4444]/20' : 'bg-green-500/20'}`}>
                    {doorOpen ? (
                      <DoorOpen className="w-10 h-10 text-[#EF4444]" />
                    ) : (
                      <DoorClosed className="w-10 h-10 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-bold">{t('home.frontDoorName')}</div>
                    <p className={`text-sm font-medium ${doorOpen ? 'text-[#EF4444]' : 'text-green-500'}`}>
                      {doorOpen ? 'UNSECURED' : 'SECURED'}
                    </p>
                  </div>
                </div>
                
                {/* Badge trạng thái thay vì nút bấm */}
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  doorOpen ? 'bg-[#EF4444] text-white animate-pulse' : 'bg-green-500/20 text-green-500'
                }`}>
                  {doorOpen ? 'Breach' : 'Safe'}
                </div>
              </div>

              {doorOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#EF4444] text-white p-4 rounded-2xl shadow-lg shadow-red-500/20 flex items-center gap-3"
                >
                  <AlertTriangle size={20} className="animate-bounce" />
                  <p className="text-xs font-bold uppercase">{t('home.alert')}</p>
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground italic px-2">
                   {t('security.doorClosed')}
                </p>
              )}
            </div>
            
            {/* Background Icon trang trí */}
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none">
                {doorOpen ? <DoorOpen size={180}/> : <DoorClosed size={180}/>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}