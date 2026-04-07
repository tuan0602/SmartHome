import { useState, useEffect } from 'react';
import { Lightbulb, Fan } from 'lucide-react';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
// IMPORT HOOK VÀ FIREBASE
import { useSmartHome } from '../hooks/useSmartHome';
import { db } from '../../firebase';
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export function DevicesControl() {
  const { t } = useLanguage();
  
  // SỬ DỤNG HOOK DÙNG CHUNG (Lấy trạng thái thực tế từ Firebase)
  const { lightOn, fanOn, handleDeviceControl } = useSmartHome();

  // State local cho chế độ (Sẽ được đồng bộ với collection 'settings')
  const [lightMode, setLightMode] = useState<'manual' | 'auto'>('manual');
  const [fanMode, setFanMode] = useState<'manual' | 'auto'>('manual');
  const [tempThreshold, setTempThreshold] = useState([30]);
  const [lightSchedule, setLightSchedule] = useState({ on: "18:00", off: "06:00" });
  //LẮNG NGHE SETTINGS TỪ FIREBASE (Đồng bộ chế độ Auto/Manual giữa các thiết bị)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "devices"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.lightMode) setLightMode(data.lightMode);
        if (data.fanMode) setFanMode(data.fanMode);
        if (data.tempThreshold !== undefined) setTempThreshold([data.tempThreshold]);
        if (data.lightSchedule) setLightSchedule(data.lightSchedule);
      }
    });
    return () => unsub();
  }, []);

  // HÀM CẬP NHẬT CÀI ĐẶT LÊN FIREBASE
  const updateSettings = async (newData: any) => {
    try {
      await setDoc(doc(db, "settings", "devices"), newData, { merge: true });
    } catch (error) {
      console.error("Lỗi cập nhật settings:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{t('devices.title')}</h1>
        <p className="text-muted-foreground">{t('devices.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lights Section */}
        <div className="space-y-4">
          <h2 className="text-2xl">{t('devices.lights')}</h2>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-2xl border border-border shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${lightOn ? 'bg-[#FACC15]/20' : 'bg-muted'}`}>
                  <Lightbulb className={`w-8 h-8 ${lightOn ? 'text-[#FACC15]' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="text-lg">{t('devices.livingRoom')}</div>
                  <p className="text-sm text-muted-foreground">{lightOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              {/* Vô hiệu hóa nút bấm nếu đang ở chế độ Tự động */}
              <Switch 
                checked={lightOn} 
                onCheckedChange={() => handleDeviceControl('light', lightOn)} 
                disabled={lightMode === 'auto'}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <label className="text-sm text-muted-foreground">{t('devices.mode')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateSettings({ lightMode: 'manual' })}
                  className={`py-3 rounded-xl transition-all ${lightMode === 'manual' ? 'bg-[#38BDF8] text-white' : 'bg-accent'}`}
                >
                  {t('devices.manual')}
                </button>
                <button
                  onClick={() => updateSettings({ lightMode: 'auto' })}
                  className={`py-3 rounded-xl transition-all ${lightMode === 'auto' ? 'bg-[#38BDF8] text-white' : 'bg-accent'}`}
                >
                  {t('devices.auto')}
                </button>
              </div>
            </div>
                        {lightMode === 'auto' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="space-y-4 pt-4"
              >
                <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium uppercase">
                      {t('devices.onTime') || 'Bật lúc'}
                    </label>
                    <input 
                      type="time" 
                      value={lightSchedule.on}
                      onChange={(e) => {
                        const newSched = { ...lightSchedule, on: e.target.value };
                        setLightSchedule(newSched);
                        updateSettings({ lightSchedule: newSched });
                      }}
                      className="w-full bg-accent text-accent-foreground p-2 rounded-lg border-none focus:ring-2 focus:ring-[#38BDF8] outline-none transition-all cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium uppercase">
                      {t('devices.offTime') || 'Tắt lúc'}
                    </label>
                    <input 
                      type="time" 
                      value={lightSchedule.off}
                      onChange={(e) => {
                        const newSched = { ...lightSchedule, off: e.target.value };
                        setLightSchedule(newSched);
                        updateSettings({ lightSchedule: newSched });
                      }}
                      className="w-full bg-accent text-accent-foreground p-2 rounded-lg border-none focus:ring-2 focus:ring-[#38BDF8] outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                  ⏰ {t('devices.scheduleDesc') || `Đèn sẽ tự động hoạt động từ ${lightSchedule.on} đến ${lightSchedule.off}`}
                </p>
              </motion.div>
            )}
          </motion.div>
          
        </div>
        
        {/* Fan Section */}
        <div className="space-y-4">
          <h2 className="text-2xl">{t('devices.fan')}</h2>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-2xl border border-border shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${fanOn ? 'bg-[#38BDF8]/20' : 'bg-muted'}`}>
                  <Fan className={`w-8 h-8 ${fanOn ? 'text-[#38BDF8] animate-spin' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="text-lg">{t('devices.ceilingFan')}</div>
                  <p className="text-sm text-muted-foreground">{fanOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch 
                checked={fanOn} 
                onCheckedChange={() => handleDeviceControl('fan', fanOn)} 
                disabled={fanMode === 'auto'}
              />
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-4">
              <label className="text-sm text-muted-foreground">{t('devices.mode')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateSettings({ fanMode: 'manual' })}
                  className={`py-3 rounded-xl transition-all ${fanMode === 'manual' ? 'bg-[#38BDF8] text-white' : 'bg-accent'}`}
                >
                  {t('devices.manual')}
                </button>
                <button
                  onClick={() => updateSettings({ fanMode: 'auto' })}
                  className={`py-3 rounded-xl transition-all ${fanMode === 'auto' ? 'bg-[#38BDF8] text-white' : 'bg-accent'}`}
                >
                  {t('devices.auto')}
                </button>
              </div>
            </div>

            {fanMode === 'auto' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{t('devices.tempThreshold')}</label>
                  <span className="text-lg text-[#38BDF8] font-bold">{tempThreshold[0]}°C</span>
                </div>
                <Slider
                  value={tempThreshold}
                  onValueChange={setTempThreshold}
                  onValueCommit={(val) => updateSettings({ tempThreshold: val[0] })}
                  min={25} max={35} step={1}
                />
                <p className="text-sm text-muted-foreground bg-accent/50 p-4 rounded-lg italic">
                  🌡️ {t('devices.fanAutoDesc')} {tempThreshold[0]}°C
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}