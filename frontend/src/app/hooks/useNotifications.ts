import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, query, orderBy, limit, onSnapshot, 
  doc, updateDoc, deleteDoc, writeBatch 
} from "firebase/firestore";
import { useNavigate } from 'react-router';
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy 20 thông báo mới nhất, sắp xếp theo thời gian giảm dần
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Chuyển đổi Firestore Timestamp sang string 
        time: doc.data().timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'
      }));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hàm đánh dấu đã đọc
  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  // Hàm xóa thông báo
  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    }
  };

  return { notifications, loading, markAsRead, deleteNotification };
}