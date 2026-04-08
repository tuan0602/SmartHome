import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Award, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSmartHome } from '../hooks/useSmartHome';
import { db } from '../../firebase';
import { doc, updateDoc, onSnapshot, setDoc, addDoc, collection, serverTimestamp, query, where, getCountFromServer } from "firebase/firestore";

export function PomodoroTimer() {
  const { t } = useLanguage();
  const { handleDeviceControl } = useSmartHome();

  // --- KHỞI TẠO STATE  ---
  const [workDuration, setWorkDuration] = useState(() => Number(localStorage.getItem('pomo_work_dur')) || 25);
  const [breakDuration, setBreakDuration] = useState(() => Number(localStorage.getItem('pomo_break_dur')) || 5);
  
  const [minutes, setMinutes] = useState(workDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // ---  ĐỒNG BỘ REALTIME TỪ FIREBASE ---
  useEffect(() => {
    const pomoRef = doc(db, "settings", "pomodoro");
    const unsubscribe = onSnapshot(pomoRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.isRunning && data.endTime) {
          const now = Date.now();
          const remainingTotal = Math.floor((data.endTime - now) / 1000);

          if (remainingTotal > 0) {
            setIsActive(true);
            setIsBreak(data.type === 'break');
            setMinutes(Math.floor(remainingTotal / 60));
            setSeconds(remainingTotal % 60);
          } else {
            setIsActive(false);
          }
        } else {
          setIsActive(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

useEffect(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const historyRef = collection(db, "pomodoro_history");
  const q = query(
    historyRef,
    where("type", "==", "focus"),
    where("timestamp", ">=", today)
  );

  // Lắng nghe thay đổi Real-time
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Mỗi khi có thêm 1 document thỏa mãn điều kiện, số lượng sẽ được cập nhật
    setCompletedSessions(snapshot.size); 
  }, (error) => {
    console.error("Lỗi lắng nghe lịch sử:", error);
  });

  return () => unsubscribe();
}, []); // Chỉ chạy 1 lần khi load trang để thiết lập bộ lắng nghe

  // --- 3. LOGIC ĐẾM NGƯỢC TẠI CHỖ ---
  useEffect(() => {
    let interval: number | undefined;
    if (isActive) {
      interval = window.setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleSessionComplete();
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // ---  XỬ LÝ KHI HOÀN THÀNH PHIÊN ---
 const handleSessionComplete = async () => {
  setIsActive(false);
  const nextType = isBreak ? 'focus' : 'break';
  const nextDur = nextType === 'focus' ? workDuration : breakDuration;

  if (!isBreak) {
    // LƯU VÀO FIREBASE: Phải có timestamp server để lọc theo ngày
    await addDoc(collection(db, "pomodoro_history"), {
      type: 'focus',
      duration: workDuration,
      timestamp: serverTimestamp() // Sử dụng serverTimestamp() của Firebase
    });
    // Không cần setCompletedSessions thủ công ở đây nữa vì useEffect ở trên sẽ tự fetch lại khi isActive thành false
  }

  await updateDoc(doc(db, "settings", "pomodoro"), {
    isRunning: false,
    type: nextType,
    endTime: null
  });

  setIsBreak(!isBreak);
  setMinutes(nextDur);
  setSeconds(0);
};
  // ---CÁC HÀM ĐIỀU KHIỂN ---
  const handleStart = async () => {
    const pomoRef = doc(db, "settings", "pomodoro");
    const currentDur = minutes + (seconds / 60);
    const endTime = Date.now() + (currentDur * 60 * 1000);

    await setDoc(pomoRef, {
      isRunning: true,
      endTime: endTime,
      type: isBreak ? 'break' : 'focus',
      duration: isBreak ? breakDuration : workDuration
    }, { merge: true });

    // Gửi lệnh phần cứng (Học: true/Đỏ, Nghỉ: false/Xanh)
    handleDeviceControl('pomodoro_status', !isBreak);
  };

  const handlePause = async () => {
    await updateDoc(doc(db, "settings", "pomodoro"), { isRunning: false });
    setIsActive(false);
  };

  const handleReset = async () => {
    const pomoRef = doc(db, "settings", "pomodoro");
    await updateDoc(pomoRef, { isRunning: false, endTime: null });
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
    handleDeviceControl('pomodoro_status', false);
  };

  // ---  TÍNH TOÁN UI ---
  const currentTotalSeconds = (isBreak ? breakDuration : workDuration) * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = currentTotalSeconds > 0 ? ((currentTotalSeconds - remainingSeconds) / currentTotalSeconds) * 100 : 0;

  // --- THỐNG KÊ MỤC TIÊU ---
  const dailyGoal = 8;
  const goalPercentage = Math.round((completedSessions / dailyGoal) * 100);
  // Thanh bar vật lý không được vượt quá 100% để tránh tràn giao diện
  const barWidth = Math.min(goalPercentage, 100); 
  const isGoalReached = completedSessions >= dailyGoal;


  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">{t('pomodoro.title')}</h1>
        <p className="text-muted-foreground">{t('pomodoro.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
        {/* Circle Timer */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
          <svg className="w-80 h-80 md:w-96 md:h-96 -rotate-90">
            <circle cx="50%" cy="50%" r="42%" stroke="currentColor" className="text-border" strokeWidth="12" fill="none" />
            <motion.circle
              cx="50%" cy="50%" r="42%"
              stroke={isBreak ? '#FACC15' : '#38BDF8'}
              strokeWidth="12" fill="none" strokeLinecap="round"
              strokeDasharray="100 100"
              animate={{ strokeDashoffset: 100 - progress }}
              className="transition-all duration-1000"
              pathLength="100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl md:text-8xl font-bold tabular-nums mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-lg font-medium text-muted-foreground uppercase tracking-widest">
                {isBreak ? `☕ Break` : `🎯 Focus`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls & Settings */}
        <div className="w-full max-w-md space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase">
              <Settings2 className="w-4 h-4" /> {t('pomodoro.settings') || 'Cấu hình'}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Tập trung</label>
                <input 
                  type="number" 
                  value={workDuration === 0 ? '' : workDuration}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setWorkDuration(0);
                      return;
                    }
                    const num = parseInt(val);
                    if (!isNaN(num)) {
                      setWorkDuration(num);
                      if (num > 0) {
                        localStorage.setItem('pomo_work_dur', num.toString());
                        if (!isActive && !isBreak) setMinutes(num);
                      }
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-accent/50 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#38BDF8]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Nghỉ ngơi</label>
                <input 
                    type="number" 
                    value={breakDuration === 0 ? '' : breakDuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setBreakDuration(0);
                        return;
                      }

                      const num = parseInt(val);
                      if (!isNaN(num)) {
                        setBreakDuration(num);
                        if (num > 0) {
                          localStorage.setItem('pomo_break_dur', num.toString());
                          if (!isActive && isBreak) setMinutes(num);
                        }
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-accent/50 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {!isActive ? (
                <button onClick={handleStart} className="w-full py-4 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#38BDF8]/20 transition-all">
                  <Play size={20} fill="currentColor" /> {t('pomodoro.start')}
                </button>
              ) : (
                <button onClick={handlePause} className="w-full py-4 bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#0F172A] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                  <Pause size={20} fill="currentColor" /> {t('pomodoro.pause')}
                </button>
              )}
              <button onClick={handleReset} className="w-full py-4 bg-accent hover:bg-accent/80 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors">
                <RotateCcw size={18} /> {t('pomodoro.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- PHẦN THỐNG KÊ  --- */}
      {/* Mục tiêu ngày - Đã sửa theo cách 1 */}
        <div className="bg-card/50 p-6 rounded-3xl border border-border flex flex-col justify-center px-8 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Mục tiêu ngày</p>
              <p className="text-sm font-semibold">
                {completedSessions} <span className="text-muted-foreground">/ {dailyGoal} phiên</span>
              </p>
            </div>
            {/* Hiển thị con số % thực tế (ví dụ 175%) và đổi màu khi đạt mục tiêu */}
            <span className={`text-xl font-black transition-colors duration-500 ${isGoalReached ? 'text-green-500' : 'text-[#38BDF8]'}`}>
              {goalPercentage}%
            </span>
          </div>

          <div className="h-3 bg-accent rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${barWidth}%`,
                // Đổi màu thanh bar sang xanh lá khi đạt/vượt 100%
                backgroundColor: isGoalReached ? '#22C55E' : '#38BDF8' 
              }}
              className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(56,189,248,0.3)]"
            />
          </div>

          {/* Dòng chữ khích lệ khi vượt chỉ tiêu */}
          {isGoalReached && (
            <p className="text-[10px] text-green-500 font-bold text-right">
              ★ ĐÃ VƯỢT CHỈ TIÊU XUẤT SẮC!
            </p>
          )}
        </div>
    </div>
  );
}