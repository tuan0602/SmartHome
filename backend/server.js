const admin = require('firebase-admin');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log("Firebase Admin đã sẵn sàng!");

// Biến lưu trữ cấu hình từ Web (Manual/Auto và Ngưỡng nhiệt độ)
let currentSettings = {
  fanMode: 'manual',
  tempThreshold: 30,
  lightMode: 'manual'
};

// --- LẮNG NGHE CẤU HÌNH (SETTINGS) ---
// Đồng bộ chế độ Auto/Manual từ trang DevicesControl
db.collection('settings').doc('devices').onSnapshot(doc => {
  if (doc.exists) {
    currentSettings = doc.data();
    console.log("⚙️ Cấu hình hệ thống:", currentSettings);
  }
}, err => console.error("Lỗi nghe settings:", err));

// ---LẮNG NGHE LỆNH ĐIỀU KHIỂN (COMMANDS) ---
// Dùng để thực thi khi bạn bấm nút trên Web (Manual Mode)
db.collection('commands')
  .orderBy('timestamp', 'desc')
  .limit(1)
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const cmd = change.doc.data();
        
        // Chỉ thực hiện lệnh thủ công nếu thiết bị đó đang ở chế độ MANUAL
        const deviceMode = cmd.device === 'fan' ? currentSettings.fanMode : currentSettings.lightMode;
        
        if (deviceMode === 'manual') {
          console.log(`🎮 [MANUAL] Thực thi lệnh: ${cmd.status.toUpperCase()} cho ${cmd.device}`);
          //  chỗ này sẽ gửi lệnh qua MQTT hoặc Serial cho mạch thật
        }
      }
    });
  });

// --- HÀM GIẢ LẬP CẢM BIẾN & LOGIC TỰ ĐỘNG ---
const runSystemLoop = async () => {
  try {
    const temp = Math.floor(Math.random() * 10) + 25; // 25-35 độ
    const hum = Math.floor(Math.random() * 20) + 60;

    // Gửi dữ liệu cảm biến lên Web
    await db.collection('sensor_data').add({
      temperature: temp,
      humidity: hum,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`🌡️ Cảm biến: ${temp}°C | ${hum}%`);

    // LOGIC TỰ ĐỘNG CHO QUẠT (AUTO MODE)
    if (currentSettings.fanMode === 'auto') {
      const shouldBeOn = temp > currentSettings.tempThreshold;
      
      // Ghi lệnh vào Firebase để Web tự cập nhật trạng thái nút bấm (Đồng bộ UI)
      await db.collection('commands').add({
        device: 'fan',
        status: shouldBeOn ? 'on' : 'off',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        note: "Auto-controlled by Backend"
      });
      
      console.log(`[AUTO] Nhiệt độ ${temp} > Ngưỡng ${currentSettings.tempThreshold} => Quạt: ${shouldBeOn ? 'BẬT' : 'TẮT'}`);
    }

  } catch (error) {
    console.error("Lỗi hệ thống:", error);
  }
};

// Chạy vòng lặp hệ thống mỗi 10 giây
setInterval(runSystemLoop, 10000);

console.log("Hệ thống đang chạy: Đợi lệnh từ Web và quét cảm biến mỗi 10s...");