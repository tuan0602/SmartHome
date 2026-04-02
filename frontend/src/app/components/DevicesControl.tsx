import { useState } from 'react';
import { Lightbulb, Fan } from 'lucide-react';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export function DevicesControl() {
  const { t } = useLanguage();
  const [lightOn, setLightOn] = useState(true);
  const [lightMode, setLightMode] = useState<'manual' | 'auto'>('auto');
  
  const [fanOn, setFanOn] = useState(false);
  const [fanMode, setFanMode] = useState<'manual' | 'auto'>('manual');
  const [tempThreshold, setTempThreshold] = useState([30]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{t('devices.title')}</h1>
        <p className="text-muted-foreground">{t('devices.subtitle')}</p>
      </div>

      {/* Grid Layout for Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lights Section */}
        <div className="space-y-4">
          <h2 className="text-2xl">{t('devices.lights')}</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-8 rounded-2xl border border-border shadow-lg space-y-6"
          >
            {/* Light Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${lightOn ? 'bg-[#FACC15]/20' : 'bg-muted'}`}>
                  <Lightbulb className={`w-8 h-8 transition-colors ${lightOn ? 'text-[#FACC15]' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <div className="text-lg">{t('devices.livingRoom')}</div>
                  <p className="text-sm text-muted-foreground">{lightOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch checked={lightOn} onCheckedChange={setLightOn} />
            </div>

            <div className="h-px bg-border" />

            {/* Light Mode */}
            <div className="space-y-4">
              <label className="text-sm text-muted-foreground">{t('devices.mode')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLightMode('manual')}
                  className={`py-3 rounded-xl transition-all ${
                    lightMode === 'manual'
                      ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20'
                      : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }`}
                >
                  {t('devices.manual')}
                </button>
                <button
                  onClick={() => setLightMode('auto')}
                  className={`py-3 rounded-xl transition-all ${
                    lightMode === 'auto'
                      ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20'
                      : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }`}
                >
                  {t('devices.auto')}
                </button>
              </div>
              {lightMode === 'auto' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-muted-foreground bg-accent p-4 rounded-lg"
                >
                  📅 {t('devices.autoMode')}
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Fan Section */}
        <div className="space-y-4">
          <h2 className="text-2xl">{t('devices.fan')}</h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-8 rounded-2xl border border-border shadow-lg space-y-6"
          >
            {/* Fan Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${fanOn ? 'bg-[#38BDF8]/20' : 'bg-muted'}`}>
                  <Fan className={`w-8 h-8 transition-all ${fanOn ? 'text-[#38BDF8] animate-spin' : 'text-muted-foreground'}`} style={{ animationDuration: '2s' }} />
                </div>
                <div>
                  <div className="text-lg">{t('devices.ceilingFan')}</div>
                  <p className="text-sm text-muted-foreground">{fanOn ? t('home.on') : t('home.off')}</p>
                </div>
              </div>
              <Switch checked={fanOn} onCheckedChange={setFanOn} />
            </div>

            <div className="h-px bg-border" />

            {/* Fan Mode */}
            <div className="space-y-4">
              <label className="text-sm text-muted-foreground">{t('devices.mode')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFanMode('manual')}
                  className={`py-3 rounded-xl transition-all ${
                    fanMode === 'manual'
                      ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20'
                      : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }`}
                >
                  {t('devices.manual')}
                </button>
                <button
                  onClick={() => setFanMode('auto')}
                  className={`py-3 rounded-xl transition-all ${
                    fanMode === 'auto'
                      ? 'bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20'
                      : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }`}
                >
                  {t('devices.auto')}
                </button>
              </div>
            </div>

            {/* Temperature Threshold */}
            {fanMode === 'auto' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">{t('devices.tempThreshold')}</label>
                  <span className="text-lg text-[#38BDF8]">{tempThreshold[0]}°C</span>
                </div>
                <Slider
                  value={tempThreshold}
                  onValueChange={setTempThreshold}
                  min={25}
                  max={35}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>25°C</span>
                  <span>35°C</span>
                </div>
                <p className="text-sm text-muted-foreground bg-accent p-4 rounded-lg">
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