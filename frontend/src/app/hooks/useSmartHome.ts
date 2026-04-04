import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export function useSmartHome() {
  const [sensorData, setSensorData] = useState({ temperature: 0, humidity: 0 });
  const [lightOn, setLightOn] = useState(false);
  const [fanOn, setFanOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  // 1. Lắng nghe cảm biến
  useEffect(() => {
    const q = query(collection(db, "sensor_data"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setSensorData({ temperature: data.temperature || 0, humidity: data.humidity || 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Lắng nghe trạng thái thiết bị để đồng bộ
  useEffect(() => {
    const q = query(collection(db, "commands"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const isOn = data.status === "on";
        if (data.device === "light") setLightOn(isOn);
        if (data.device === "fan") setFanOn(isOn);
        if (data.device === "door") setDoorOpen(isOn);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Hàm điều khiển chung
  const handleDeviceControl = async (device: string, currentState: boolean) => {
    const newState = !currentState;
    // Cập nhật UI tạm thời (tùy chọn)
    if (device === 'light') setLightOn(newState);
    if (device === 'fan') setFanOn(newState);
    if (device === 'door') setDoorOpen(newState);

    try {
      await addDoc(collection(db, "commands"), {
        device,
        status: newState ? "on" : "off",
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Lỗi điều khiển:", error);
    }
  };

  // Trả về tất cả những gì các trang cần dùng
  return {
    sensorData,
    lightOn,
    fanOn,
    doorOpen,
    handleDeviceControl
  };
}