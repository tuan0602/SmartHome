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

// --- KHỞI TẠO DOCUMENT POMODORO  ---
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

// --- LẮNG NGHE TRẠNG THÁI POMODORO THỜI GIAN THỰC ---
// Kênh này dùng để đồng bộ trạng thái học tập xuyên suốt hệ thống
db.collection('settings').doc('pomodoro').onSnapshot(doc => {
  if (doc.exists) {
    const data = doc.data();
    
    if (data.isRunning && data.endTime) {
      const now = Date.now();
      const remaining = data.endTime - now;

      if (remaining > 0) {
        const statusType = data.type.toUpperCase();
        console.log(`⏳ [POMODORO] ${statusType === 'FOCUS' ? '🔴 ĐANG HỌC' : '🟢 ĐANG NGHỈ'}. Còn lại: ${Math.floor(remaining/1000)}s`);
        
        // Logic gửi lệnh cho phần cứng sau này:
        // const color = statusType === 'FOCUS' ? 'RED' : 'GREEN';
        // mqttClient.publish('your_feed/led-rgb', color);
      } else {
        console.log("🔔 [POMODORO] Hết giờ! Chờ phiên tiếp theo...");
      }
    } else {
      console.log("🛑 [POMODORO] Đang dừng.");
    }
  }
}, err => console.error("Lỗi nghe Pomodoro:", err));

// --- LẮNG NGHE LỆNH THỦ CÔNG (COMMANDS) ---
// Chỉ dành cho việc điều khiển trực tiếp Quạt và Đèn
db.collection('commands')
  .orderBy('timestamp', 'desc')
  .limit(1)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const cmd = change.doc.data();

        // Chỉ xử lý các thiết bị thủ công (Fan, Light)
        if (cmd.device === 'fan' || cmd.device === 'light') {
          const deviceMode = cmd.device === 'fan' ? currentSettings.fanMode : currentSettings.lightMode;
          
          if (deviceMode === 'manual') {
            console.log(`🎮 [MANUAL] Thực thi: ${cmd.status.toUpperCase()} cho ${cmd.device}`);
            // mqttClient.publish(`feeds/${cmd.device}`, cmd.status.toUpperCase());
          }
        }
      }
    });
  });

// --- 5. CÁC HÀM HỖ TRỢ LOGIC TỰ ĐỘNG ---
const checkSchedule = (nowStr, onTime, offTime) => {
  if (onTime < offTime) {
    return nowStr >= onTime && nowStr < offTime;
  } else {
    return nowStr >= onTime || nowStr < offTime;
  }
};

const runSystemLoop = async () => {
  try {
    const temp = Math.floor(Math.random() * 10) + 25;
    const hum = Math.floor(Math.random() * 20) + 60;

    // Gửi dữ liệu cảm biến giả lập lên Firebase
    await db.collection('sensor_data').add({
      temperature: temp,
      humidity: hum,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`🌡️ Sensor Update: ${temp}°C | ${hum}%`);

    // LOGIC TỰ ĐỘNG CHO QUẠT
    if (currentSettings.fanMode === 'auto') {
      const shouldBeOn = temp > currentSettings.tempThreshold;
      await db.collection('commands').add({
        device: 'fan',
        status: shouldBeOn ? 'on' : 'off',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Auto-controlled by Temp"
      });
      console.log(`[AUTO FAN] Logic: ${temp}°C > ${currentSettings.tempThreshold}°C => ${shouldBeOn ? 'ON' : 'OFF'}`);
    }

    // LOGIC TỰ ĐỘNG CHO ĐÈN
    if (currentSettings.lightMode === 'auto' && currentSettings.lightSchedule) {
      const now = new Date();
      const currentTimeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                             now.getMinutes().toString().padStart(2, '0');

      const { on, off } = currentSettings.lightSchedule;
      const shouldLightOn = checkSchedule(currentTimeStr, on, off);

      await db.collection('commands').add({
        device: 'light',
        status: shouldLightOn ? 'on' : 'off',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: `Schedule check at ${currentTimeStr}`
      });
      console.log(`[AUTO LIGHT] Giờ: ${currentTimeStr} | Schedule: ${on}-${off} => ${shouldLightOn ? 'ON' : 'OFF'}`);
    }

  } catch (error) {
    console.error("❌ Lỗi trong System Loop:", error);
  }
};

// --- CHẠY HỆ THỐNG ---
setInterval(runSystemLoop, 10000); // Cập nhật cảm biến và auto logic mỗi 10 giây
console.log("🌟 Hệ thống Smart Home Backend đang vận hành...");