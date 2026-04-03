import { useState, useEffect } from 'react';
import { Thermometer, Droplets, Lightbulb, Fan, DoorOpen, DoorClosed } from 'lucide-react';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

// firebase imports
import { db } from '../../firebase'; 
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
export function HomeDashboard() {
  const { t } = useLanguage();

  // State for sensor data and device statuses
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  // Device states (in a real app, these would also come from Firebase)
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  // LẮNG NGHE DỮ LIỆU MỚI TỪ FIREBASE
  useEffect(() => {
    // Tạo câu truy vấn: Vào bảng 'sensor_data', sắp xếp thời gian giảm dần, lấy 1 cái mới nhất
    const q = query(
      collection(db, "sensor_data"), 
      orderBy("timestamp", "desc"), 
      limit(1)
    );

    // Lắng nghe thay đổi (onSnapshot)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setSensorData({
          temperature: data.temperature || 0,
          humidity: data.humidity || 0
        });
        console.log("Dữ liệu mới từ Firebase:", data);
      }
    });

    return () => unsubscribe(); // Hủy lắng nghe khi thoát trang
  }, []);

  // Lắng nghe trạng thái thiết bị (Đèn, Quạt, Cửa) từ Firebase
useEffect(() => {
  const q = query(
    collection(db, "commands"),
    orderBy("timestamp", "desc"),
    limit(1) // Chỉ lấy đúng 1 lệnh mới nhất thôi
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      const isOn = data.status === "on";

      // Chỉ cập nhật nếu timestamp của Firebase đã tồn tại (tránh lag do local cache)
      if (data.timestamp) {
        if (data.device === "light") setLightOn(isOn);
        if (data.device === "fan") setFanOn(isOn);
        if (data.device === "door") setDoorOpen(isOn);
      }
    }
  });

  return () => unsubscribe();
}, []);

  // HÀM GỬI LỆNH ĐIỀU KHIỂN 
  const handleDeviceControl = async (device: string, currentState: boolean, setter: (val: boolean) => void) => {
  const newState = !currentState;
  // setter(newState); 
  try {
    await addDoc(collection(db, "commands"), {
      device: device,
      status: newState ? "on" : "off",
      timestamp: serverTimestamp() 
    });
  } catch (error) {
    console.error("Lỗi gửi lệnh:", error);
    setter(currentState); 
  }
};

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{t('home.title')}</h1>
        <p className="text-muted-foreground">{t('home.subtitle')}</p>
      </div>

      {/* Temperature & Humidity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#38BDF8]/20 rounded-xl">
              <Thermometer className="w-6 h-6 text-[#38BDF8]" />
            </div>
            <span className="text-sm text-muted-foreground">{t('home.temperature')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl">{sensorData.temperature}°C</div>
            <p className="text-xs text-muted-foreground">{t('home.updatedNow')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#38BDF8]/20 rounded-xl">
              <Droplets className="w-6 h-6 text-[#38BDF8]" />
            </div>
            <span className="text-sm text-muted-foreground">{t('home.humidity')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl">{sensorData.humidity}%</div>
            <p className="text-xs text-muted-foreground">{t('home.updatedNow')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl transition-colors ${lightOn ? 'bg-[#FACC15]/20' : 'bg-muted'}`}>
              <Lightbulb className={`w-6 h-6 transition-colors ${lightOn ? 'text-[#FACC15]' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-sm text-muted-foreground">{t('home.activeLights')}</span>
          </div>
          <div className="space-y-1">
            <div className="text-4xl">{lightOn ? '1' : '0'}</div>
            <p className="text-xs text-muted-foreground">{lightOn ? t('home.on') : t('home.allOff')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl transition-colors ${doorOpen ? 'bg-[#EF4444]/20' : 'bg-green-500/20'}`}>
              {doorOpen ? (
                <DoorOpen className="w-6 h-6 text-[#EF4444]" />
              ) : (
                <DoorClosed className="w-6 h-6 text-green-500" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">{t('home.doorStatus')}</span>
          </div>
          <div className="space-y-1">
            <div className={`text-4xl ${doorOpen ? 'text-[#EF4444]' : 'text-green-500'}`}>
              {doorOpen ? t('home.open') : t('home.closed')}
            </div>
            <p className="text-xs text-muted-foreground">{t('home.frontDoor')}</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Controls */}
        <div className="space-y-4">
          <h2 className="text-2xl mb-4">{t('home.quickControls')}</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${lightOn ? 'bg-[#FACC15]/20' : 'bg-muted'}`}>
                  <Lightbulb className={`w-6 h-6 transition-colors ${lightOn ? 'text-[#FACC15]' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="text-lg">{t('home.livingRoomLight')}</div>
                  <p className="text-sm text-muted-foreground">{lightOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch checked={lightOn} onCheckedChange={() => handleDeviceControl('light', lightOn, setLightOn)} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${fanOn ? 'bg-[#38BDF8]/20' : 'bg-muted'}`}>
                  <Fan className={`w-6 h-6 transition-all ${fanOn ? 'text-[#38BDF8] animate-spin' : 'text-muted-foreground'}`} style={{ animationDuration: '2s' }} />
                </div>
                <div>
                  <div className="text-lg">{t('home.ceilingFan')}</div>
                  <p className="text-sm text-muted-foreground">{fanOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch checked={fanOn} onCheckedChange={() => handleDeviceControl('fan', fanOn, setFanOn)} />
            </div>
          </motion.div>
        </div>

        {/* Door Status */}
        <div className="space-y-4">
          <h2 className="text-2xl mb-4">{t('home.security')}</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-lg h-full"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${doorOpen ? 'bg-[#EF4444]/20' : 'bg-green-500/20'}`}>
                    {doorOpen ? (
                      <DoorOpen className="w-8 h-8 text-[#EF4444]" />
                    ) : (
                      <DoorClosed className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg">{t('home.frontDoorName')}</div>
                    <p className={`text-sm ${doorOpen ? 'text-[#EF4444]' : 'text-green-500'}`}>
                      {doorOpen ? t('home.open') : t('home.closed')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeviceControl('door', doorOpen, setDoorOpen)}
                  className="px-6 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-sm"
                >
                  {t('home.toggle')}
                </button>
              </div>
              {doorOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#EF4444]/10 border border-[#EF4444]/20 p-4 rounded-xl"
                >
                  <p className="text-sm text-[#EF4444]">
                    ⚠️ {t('home.alert')}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}