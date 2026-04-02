const admin = require('firebase-admin');

// 1. Khởi tạo Firebase Admin với file  JSON
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log("Firebase Admin đã sẵn sàng!");

// 2. Hàm giả lập gửi dữ liệu (Để bạn kiểm tra trên Firebase Console)
const sendTestData = async () => {
  try {
    const testData = {
      temperature: Math.floor(Math.random() * 10) + 25, // Ngẫu nhiên từ 25-35
      humidity: Math.floor(Math.random() * 20) + 60,    // Ngẫu nhiên từ 60-80
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      note: "Dữ liệu giả lập từ Node.js"
    };

    // Ghi vào collection tên là 'sensor_data'
    const res = await db.collection('sensor_data').add(testData);
    console.log("Đã ghi dữ liệu thành công! ID:", res.id);
  } catch (error) {
    console.error("Lỗi khi ghi dữ liệu:", error);
  }
};

// Tự động gửi sau mỗi 5 giây
setInterval(sendTestData, 5000);

console.log("Đang gửi dữ liệu giả lập mỗi 5 giây... Hãy mở Firebase Console để xem.");