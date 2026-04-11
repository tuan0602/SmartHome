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

// --- KHỞI TẠO CÁC DOCUMENT MẶC ĐỊNH ---
const initDatabase = async () => {
  // Init Pomodoro
  const pomoRef = db.collection('settings').doc('pomodoro');
  const pomoDoc = await pomoRef.get();
  if (!pomoDoc.exists) {
    await pomoRef.set({ isRunning: false, endTime: null, type: 'focus', duration: 25 });
    console.log("📝 Đã khởi tạo cấu hình Pomodoro trên Firebase");
  }

  //Init Security Door 
  const doorRef = db.collection('security').doc('door');
  const doorDoc = await doorRef.get();
  if (!doorDoc.exists) {
    await doorRef.set({ 
      status: 'closed', 
      lastChanged: admin.firestore.FieldValue.serverTimestamp() 
    });
    console.log("📝 Đã khởi tạo cấu hình Security Door trên Firebase");
  }
};
initDatabase();

// --- LẮNG NGHE CẤU HÌNH HỆ THỐNG (DEVICES) ---
db.collection('settings').doc('devices').onSnapshot(doc => {
  if (doc.exists) {
    currentSettings = doc.data();
    console.log("⚙️ Đã cập nhật cấu hình thiết bị (Fan/Light)");
  }
}, err => console.error("Lỗi nghe settings:", err));

// --- LẮNG NGHE POMODORO ---
let lastPomoSignal = null;
db.collection('settings').doc('pomodoro').onSnapshot(doc => {
  if (doc.exists) {
    const data = doc.data();
    let currentSignal = 2; 

    if (data.isRunning && data.endTime && (data.endTime - Date.now() > 0)) {
      currentSignal = (data.type === 'focus') ? 1 : 0;
    }

    if (currentSignal !== lastPomoSignal) {
      console.log(`📡 [IoT POMODORO] Gửi tín hiệu mới: ${currentSignal}`);
      lastPomoSignal = currentSignal;
    }
  }
}, err => console.error("Lỗi nghe Pomodoro:", err));

// --- LẮNG NGHE LỆNH THIẾT BỊ (MANUAL) ---
const listenToCommands = (collectionName, label) => {
  db.collection(collectionName)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const cmd = change.doc.data();
          // Kiểm tra mode tương ứng (fanMode hoặc lightMode)
          const mode = collectionName.includes('fan') ? currentSettings.fanMode : currentSettings.lightMode;
          if (mode === 'manual') {
            console.log(`🌀 [${label} MANUAL] Thực thi: ${cmd.status.toUpperCase()}`);
          }
        }
      });
    });
};
listenToCommands('fan_commands', 'FAN');
listenToCommands('light_commands', 'LIGHT');


// --- CÁC HÀM HỖ TRỢ LOGIC ---
const checkSchedule = (nowStr, onTime, offTime) => {
  if (onTime < offTime) return nowStr >= onTime && nowStr < offTime;
  return nowStr >= onTime || nowStr < offTime;
};

// --- LOGIC XỬ LÝ CỬA (SECURITY) ---
let lastDoorStatus = 'closed';
const updateDoorSecurity = async (distance) => {
  // Ngưỡng: > 15cm được coi là cửa mở 
  const currentStatus = distance > 15 ? 'open' : 'closed';

  // Xử lý khi trạng thái thay đổi để tránh spam database
  if (currentStatus !== lastDoorStatus) {
    console.log(`🛡️ [SECURITY] Cảnh báo: Cửa đang ${currentStatus === 'open' ? 'MỞ 🔴' : 'ĐÓNG 🟢'}`);
    
    // Cập nhật trạng thái tức thời để Web hiển thị
    await db.collection('security').doc('door').set({
      status: currentStatus,
      lastChanged: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Ghi vào lịch sử sự kiện (Activity Log)
    await db.collection('door_events').add({
      event: currentStatus === 'open' ? 'Cửa bị mở' : 'Cửa đã đóng',
      status: currentStatus,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    lastDoorStatus = currentStatus;
  }
};

let logCounter = 0;
let lastAutoFanStatus = null;
let lastAutoLightStatus = null;
let lastNotifyDoorStatus = 'closed';
let lastNotifyTempStatus = 'normal';

// --- VÒNG LẶP HỆ THỐNG ---
const runSystemLoop = async () => {
  try {
    const sessionLogs = []; 

    // 1. GIẢ LẬP DỮ LIỆU
    const temp = Math.floor(Math.random() * 10) + 25; 
    const hum = Math.floor(Math.random() * 20) + 60;
    const doorDistance = Math.random() > 0.8 ? 50 : 5; 
    const currentDoorStatus = doorDistance > 15 ? 'open' : 'closed';

    // 2. LOGIC ĐỒNG BỘ CỬA 
    if (currentDoorStatus !== lastNotifyDoorStatus) {
      const batch = db.batch();
      
      // Tạo bản ghi cho tab Notification
      const notifyRef = db.collection('notifications').doc();
      batch.set(notifyRef, {
        title: currentDoorStatus === 'open' ? 'doorOpened' : 'doorClosed',
        message: currentDoorStatus === 'open' ? 'doorOpenedAt' : 'doorClosedAt',
        type: 'door',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Tạo bản ghi cho tab Security (door_events)
      const eventRef = db.collection('door_events').doc();
      batch.set(eventRef, {
        status: currentDoorStatus,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Cập nhật trạng thái tức thời cho trang Security 
      const doorDocRef = db.collection('security').doc('door');
      batch.set(doorDocRef, {
        status: currentDoorStatus,
        lastChanged: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await batch.commit();
      
      sessionLogs.push(`📢 [SECURITY] Cửa vừa chuyển sang trạng thái: ${currentDoorStatus.toUpperCase()}`);
      lastNotifyDoorStatus = currentDoorStatus;
    }

    // 3. LOGIC NHIỆT ĐỘ 
    const dynamicThreshold = currentSettings.tempThreshold || 30;

    if (temp > dynamicThreshold && lastNotifyTempStatus === 'normal') {
      await db.collection('notifications').add({
        title: 'tempAlert',
        message: 'tempExceeded',
        type: 'temperature',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      lastNotifyTempStatus = 'alert';
      sessionLogs.push(`🔥 [ALERT] Vượt ngưỡng ${dynamicThreshold}°C! (Hiện tại: ${temp}°C)`);
    } else if (temp <= dynamicThreshold && lastNotifyTempStatus === 'alert') {
      lastNotifyTempStatus = 'normal';
      sessionLogs.push(`✅ [SYSTEM] Nhiệt độ đã hạ dưới ngưỡng ${dynamicThreshold}°C`);
    }

    // 4. CẬP NHẬT SENSOR DATA 
    await db.collection('sensor_data').doc('current').set({
      temperature: temp,
      humidity: hum,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. LOGIC AUTO FAN 
    if (currentSettings.fanMode === 'auto') {
      const shouldBeOn = temp > dynamicThreshold;
      const newStatus = shouldBeOn ? 'on' : 'off';
      
      if (newStatus !== lastAutoFanStatus) {
        await db.collection('fan_commands').add({
          status: newStatus,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          note: `Auto (Threshold: ${dynamicThreshold}°C)`
        });
        lastAutoFanStatus = newStatus;
        sessionLogs.push(`🌀 [AUTO] Quạt ${newStatus.toUpperCase()} do ngưỡng ${dynamicThreshold}°C`);
      }
    }

    // --- HIỂN THỊ TERMINAL ---
    console.clear(); 
    console.log("=========================================");
    console.log("   🏠 SMART HOME CENTRAL CONTROLLER      ");
    console.log(`   Time: ${new Date().toLocaleTimeString()}               `);
    console.log("=========================================");
    console.log(`🌡️  TEMP:  ${temp}°C | 💧 HUM: ${hum}%`);
    console.log(`🚪 DOOR:  [ ${currentDoorStatus.toUpperCase()} ]`);
    console.log("-----------------------------------------");
    console.log(`🌀 FAN:   MODE: ${currentSettings.fanMode.toUpperCase()} | STATUS: ${lastAutoFanStatus || 'OFF'}`);
    console.log(`💡 LIGHT: MODE: ${currentSettings.lightMode.toUpperCase()} | STATUS: ${lastAutoLightStatus || 'OFF'}`);
    
    if (lastPomoSignal !== null) {
        const pStatus = lastPomoSignal === 1 ? "🔥 FOCUS" : (lastPomoSignal === 0 ? "☕ BREAK" : "💤 IDLE");
        console.log(`⏳ POMO:  ${pStatus}`);
    }
    console.log("=========================================");
    
    // IN CÁC SỰ KIỆN PHÁT SINH TRONG PHIÊN NÀY
    if (sessionLogs.length > 0) {
        console.log("\n📝 [SỰ KIỆN MỚI]:");
        sessionLogs.forEach(log => console.log(log));
    } else {
        console.log("\n🟢 Hệ thống hoạt động bình thường...");
    }

  } catch (error) {
    console.error("❌ Lỗi System Loop:", error);
  }
};

setInterval(runSystemLoop, 10000);
console.log("🌟 Backend Smart Home (Security Door Integrated) đã sẵn sàng!");