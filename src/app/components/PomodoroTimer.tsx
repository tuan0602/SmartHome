import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export function PomodoroTimer() {
  const { t } = useLanguage();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive) {
      interval = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            if (isBreak) {
              setMinutes(25);
              setIsBreak(false);
            } else {
              setMinutes(5);
              setIsBreak(true);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setIsBreak(false);
  };

  const progress = isBreak
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{t('pomodoro.title')}</h1>
        <p className="text-muted-foreground">{t('pomodoro.subtitle')}</p>
      </div>

      {/* Main Content - Centered */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Circular Timer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <svg className="w-96 h-96 -rotate-90">
            {/* Background circle */}
            <circle
              cx="192"
              cy="192"
              r="170"
              stroke="currentColor"
              className="text-border"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="192"
              cy="192"
              r="170"
              stroke={isBreak ? '#FACC15' : '#38BDF8'}
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 170}`}
              strokeDashoffset={`${2 * Math.PI * 170 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl tabular-nums mb-4">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-xl text-muted-foreground">
                {isBreak ? `☕ ${t('pomodoro.takeBreak')}` : `🎯 ${t('pomodoro.stayFocused')}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls and Info */}
        <div className="space-y-8">
          {/* Session Info */}
          <div className="bg-card p-8 rounded-2xl border border-border w-full max-w-md">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('pomodoro.currentSession')}</p>
              <p className="text-4xl text-[#38BDF8]">
                {isBreak ? t('pomodoro.break') : t('pomodoro.focus')}
              </p>
              <p className="text-sm text-muted-foreground">
                {isBreak ? t('pomodoro.breakSession') : t('pomodoro.focusSession')}
              </p>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('pomodoro.status')}</span>
                  <span className={isActive ? 'text-green-500' : 'text-muted-foreground'}>
                    {isActive ? `● ${t('pomodoro.running')}` : `○ ${t('pomodoro.paused')}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 w-full max-w-md">
            {!isActive ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="flex items-center justify-center gap-3 px-8 py-5 bg-[#38BDF8] hover:bg-[#38BDF8]/80 rounded-2xl transition-colors shadow-lg shadow-[#38BDF8]/20 text-lg"
              >
                <Play className="w-6 h-6" />
                {t('pomodoro.start')}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePause}
                className="flex items-center justify-center gap-3 px-8 py-5 bg-[#FACC15] hover:bg-[#FACC15]/80 text-[#0F172A] rounded-2xl transition-colors shadow-lg shadow-[#FACC15]/20 text-lg"
              >
                <Pause className="w-6 h-6" />
                {t('pomodoro.pause')}
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-accent hover:bg-accent/80 rounded-2xl transition-colors text-lg"
            >
              <RotateCcw className="w-6 h-6" />
              {t('pomodoro.reset')}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}