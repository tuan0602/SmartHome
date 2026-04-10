import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, query, orderBy, limit, onSnapshot, 
  addDoc, serverTimestamp, doc, where 
} from "firebase/firestore";

export function useSmartHome() {
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  // --- CÁC STATE BỔ SUNG CHO TRANG SECURITY ---
  const [doorLogs, setDoorLogs] = useState<any[]>([]);
  const [todayOpens, setTodayOpens] = useState(0);
  const [lastActivity, setLastActivity] = useState('--:--');

  useEffect(() => {
    // 1. Lắng nghe cảm biến môi trường (Realtime)
    const unsubSensor = onSnapshot(doc(db, "sensor_data", "current"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSensorData({ 
          temperature: data.temperature || 0, 
          humidity: data.humidity || 0 
        });
      }
    });

    // 2. Lắng nghe trạng thái Thiết bị (Light/Fan)
    const unsubLight = onSnapshot(query(collection(db, "light_commands"), orderBy("timestamp", "desc"), limit(1)), (snap) => {
      if (!snap.empty) setLightOn(snap.docs[0].data().status === "on");
    });

    const unsubFan = onSnapshot(query(collection(db, "fan_commands"), orderBy("timestamp", "desc"), limit(1)), (snap) => {
      if (!snap.empty) setFanOn(snap.docs[0].data().status === "on");
    });

    // 3. Lắng nghe trạng thái Cửa & Hoạt động cuối (Sử dụng doc security/door)
    const unsubDoor = onSnapshot(doc(db, "security", "door"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDoorOpen(data.status === 'open');
        if (data.lastChanged) {
          const date = data.lastChanged.toDate();
          setLastActivity(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    });

    // 4. Lắng nghe Nhật ký hoạt động (10 cái gần nhất)
    const qLogs = query(collection(db, "door_events"), orderBy("timestamp", "desc"), limit(10));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Map action để hiển thị đúng i18n: security.doorOpened / security.doorClosed
          action: data.status === 'open' ? 'doorOpened' : 'doorClosed',
          time: data.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      setDoorLogs(logs);
    });

    // 5. Đếm số lần mở trong ngày (Sử dụng snapshot size để chính xác)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const qToday = query(
      collection(db, "door_events"),
      where("status", "==", "open"),
      where("timestamp", ">=", today)
    );
    const unsubTodayCount = onSnapshot(qToday, (snapshot) => {
      setTodayOpens(snapshot.size);
    });

    return () => {
      unsubSensor(); unsubLight(); unsubFan(); 
      unsubDoor(); unsubLogs(); unsubTodayCount();
    };
  }, []);

  // 6. Hàm điều khiển chung (Đã cập nhật logic cho Door)
  const handleDeviceControl = async (device: string, currentState: any) => {
    try {
      let newState: string;
      let collectionName = `${device}_commands`;

      if (device === 'door') {
        // Cửa dùng open/closed thay vì on/off
        newState = currentState ? 'closed' : 'open';
        
        // Ghi vào door_events để tạo lịch sử (Log)
        await addDoc(collection(db, "door_events"), {
          status: newState,
          timestamp: serverTimestamp()
        });
      } else {
        newState = !currentState ? "on" : "off";
      }

      await addDoc(collection(db, collectionName), {
        status: newState,
        timestamp: serverTimestamp(),
        note: "Manual Toggle"
      });
      
      console.log(`📡 [LOG] Sent ${newState} to ${collectionName}`);
    } catch (error) {
      console.error("Lỗi điều khiển:", error);
    }
  };

  return {
    sensorData,
    lightOn,
    fanOn,
    doorOpen,
    doorLogs,      // <--- Trả về cho Security
    todayOpens,    // <--- Trả về cho Security
    lastActivity,  // <--- Trả về cho Security
    handleDeviceControl
  };
}