import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, DocumentSnapshot } from "firebase/firestore";

export function useSmartHome() {
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  // 1. Lắng nghe cảm biến
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "sensor_data", "current"), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      setSensorData({ 
        temperature: data.temperature || 0, 
        humidity: data.humidity || 0 
      });
    }
  });
  return () => unsubscribe();
}, []);

  // 2. Lắng nghe trạng thái thiết bị (Tách ra để chính xác tuyệt đối)
  useEffect(() => {
    // Lắng nghe Đèn
    const qLight = query(collection(db, "light_commands"), orderBy("timestamp", "desc"), limit(1));
    const unsubLight = onSnapshot(qLight, (snap) => {
      if (!snap.empty) setLightOn(snap.docs[0].data().status === "on");
    });

    // Lắng nghe Quạt
    const qFan = query(collection(db, "fan_commands"), orderBy("timestamp", "desc"), limit(1));
    const unsubFan = onSnapshot(qFan, (snap) => {
      if (!snap.empty) setFanOn(snap.docs[0].data().status === "on");
    });

    // Lắng nghe Cửa
    const qDoor = query(collection(db, "door_commands"), orderBy("timestamp", "desc"), limit(1));
    const unsubDoor = onSnapshot(qDoor, (snap) => {
      if (!snap.empty) setDoorOpen(snap.docs[0].data().status === "on");
    });

    return () => {
      unsubLight();
      unsubFan();
      unsubDoor();
    };
  }, []);

  // 3. Hàm điều khiển chung (Điều hướng ghi vào đúng Collection)
  const handleDeviceControl = async (device: string, currentState: boolean | string) => {
    // Hỗ trợ cả boolean (cho toggle) và string (cho pomodoro)
    let newState: string;
    
    if (typeof currentState === 'boolean') {
      newState = !currentState ? "on" : "off";
    } else {
      // Nếu truyền vào string (on/off) thì dùng luôn
      newState = currentState; 
    }

    // Tạm thời cập nhật UI để phản hồi nhanh
    if (device === 'light') setLightOn(newState === "on");
    if (device === 'fan') setFanOn(newState === "on");
    if (device === 'door') setDoorOpen(newState === "on");

    try {
      // XÁC ĐỊNH COLLECTION ĐÍCH
      let collectionName = "commands"; // Dự phòng
      if (device === "fan") collectionName = "fan_commands";
      if (device === "light") collectionName = "light_commands";
      if (device === "door") collectionName = "door_commands";
      if (device === "pomodoro_status") collectionName = "commands"; // Giữ pomodoro ở commands hoặc tùy bạn

      await addDoc(collection(db, collectionName), {
        device,
        status: newState,
        timestamp: serverTimestamp()
      });
      
      console.log(`📡 [LOG] Đã gửi lệnh ${newState} tới ${collectionName}`);
    } catch (error) {
      console.error("Lỗi điều khiển:", error);
    }
  };

  return {
    sensorData,
    lightOn,
    fanOn,
    doorOpen,
    handleDeviceControl
  };
}