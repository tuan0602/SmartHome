const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log("🚀 Firebase Admin đã sẵn sàng!");

// --- CẤU HÌNH MẶC ĐỊNH ---
let currentSettings = {
  fanMode: 'manual',
  tempThreshold: 30,
  lightMode: 'manual',
  lightSchedule: { on: "18:00", off: "06:00" }
};

// --- KHỞI TẠO DOCUMENT POMODORO ---
const initPomodoro = async () => {
  const pomoRef = db.collection('settings').doc('pomodoro');
  const doc = await pomoRef.get();
  if (!doc.exists) {
    await pomoRef.set({
      isRunning: false,
      endTime: null,
      type: 'focus',
      duration: 25
    });
    console.log("📝 Đã khởi tạo cấu hình Pomodoro trên Firebase");
  }
};
initPomodoro();

// --- LẮNG NGHE CẤU HÌNH HỆ THỐNG (DEVICES) ---
db.collection('settings').doc('devices').onSnapshot(doc => {
  if (doc.exists) {
    currentSettings = doc.data();
    console.log("⚙️ Đã cập nhật cấu hình thiết bị (Fan/Light)");
  }
}, err => console.error("Lỗi nghe settings:", err));

// --- LẮNG NGHE POMODORO (Giữ nguyên vì đã tách khỏi Commands) ---
db.collection('settings').doc('pomodoro').onSnapshot(doc => {
  if (doc.exists) {
    const data = doc.data();
    if (data.isRunning && data.endTime) {
      const now = Date.now();
      const remaining = data.endTime - now;
      if (remaining > 0) {
        console.log(`⏳ [POMODORO] ${data.type.toUpperCase()} - Còn lại: ${Math.floor(remaining/1000)}s`);
      }
    }
  }
}, err => console.error("Lỗi nghe Pomodoro:", err));

// --- 4a. LẮNG NGHE LỆNH QUẠT (FAN_COMMANDS) ---
db.collection('fan_commands')
  .orderBy('timestamp', 'desc')
  .limit(1)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const cmd = change.doc.data();
        if (currentSettings.fanMode === 'manual') {
          console.log(`🌀 [FAN MANUAL] Thực thi: ${cmd.status.toUpperCase()}`);
        }
      }
    });
  });

// --- 4b. LẮNG NGHE LỆNH ĐÈN (LIGHT_COMMANDS) ---
db.collection('light_commands')
  .orderBy('timestamp', 'desc')
  .limit(1)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const cmd = change.doc.data();
        if (currentSettings.lightMode === 'manual') {
          console.log(`💡 [LIGHT MANUAL] Thực thi: ${cmd.status.toUpperCase()}`);
        }
      }
    });
  });

// --- 5. CÁC HÀM HỖ TRỢ LOGIC TỰ ĐỘNG ---
const checkSchedule = (nowStr, onTime, offTime) => {
  if (onTime < offTime) return nowStr >= onTime && nowStr < offTime;
  return nowStr >= onTime || nowStr < offTime;
};

let logCounter = 0;
const runSystemLoop = async () => {
  try {
    const temp = Math.floor(Math.random() * 10) + 25;
    const hum = Math.floor(Math.random() * 20) + 60;

    await db.collection('sensor_data').doc('current').set({
      temperature: temp,
      humidity: hum,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // GHI LỊCH SỬ (Logs) - Cứ mỗi 6 lần chạy (60 giây) mới ghi 1 bản ghi vào lịch sử
    logCounter++;
    if (logCounter >= 6) {
      await db.collection('sensor_logs').add({
        temperature: temp,
        humidity: hum,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`📊 [LOG] Đã lưu lịch sử cảm biến vào sensor_logs`);
      logCounter = 0; // Reset bộ đếm
    }

    console.log(`🌡️ Sensor Update: ${temp}°C | ${hum}%`);

    // LOGIC AUTO CHO QUẠT -> Ghi vào fan_commands
    if (currentSettings.fanMode === 'auto') {
      const shouldBeOn = temp > currentSettings.tempThreshold;
      await db.collection('fan_commands').add({
        status: shouldBeOn ? 'on' : 'off',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Auto by Temp"
      });
      console.log(`[AUTO FAN] -> ${shouldBeOn ? 'ON' : 'OFF'}`);
    }

    // LOGIC AUTO CHO ĐÈN -> Ghi vào light_commands
    if (currentSettings.lightMode === 'auto' && currentSettings.lightSchedule) {
      const now = new Date();
      const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                             now.getMinutes().toString().padStart(2, '0');
      const { on, off } = currentSettings.lightSchedule;
      const shouldLightOn = checkSchedule(currentTimeStr, on, off);

      await db.collection('light_commands').add({
        status: shouldLightOn ? 'on' : 'off',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Auto by Schedule"
      });
      console.log(`[AUTO LIGHT] -> ${shouldLightOn ? 'ON' : 'OFF'}`);
    }

  } catch (error) {
    console.error("❌ Lỗi System Loop:", error);
  }
};

setInterval(runSystemLoop, 10000);
console.log("🌟 Backend đã tách biệt fan_commands và light_commands!");