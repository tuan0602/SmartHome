import time

class PomodoroTimer:
    def __init__(self, publish_callback):
        # Khởi tạo các biến trạng thái
        self.current_state = "IDLE"
        self.start_time = 0
        self.duration = 0
        self.focus_cycles = 0
        self.last_publish_time = 0
        self.focus_duration_minutes = 25 # Thời gian focus mặc định (phút)
        
        # Hàm callback để gửi dữ liệu ngược lại cho file chính
        self.publish_callback = publish_callback

    def handle_command(self, payload):
        """Xử lý lệnh từ Dashboard gửi xuống"""
        # Nếu thiết bị gửi xuống chỉ là 1 con số (do dùng block Slider kéo số phút)
        if payload.isdigit():
            self.focus_duration_minutes = int(payload)
            print(f"*** ĐÃ SET THỜI GIAN FOCUS TẠM THỜI: {self.focus_duration_minutes} PHÚT ***")
            if self.current_state == "IDLE":
                self.publish_callback(f"Thời gian FOCUS: {self.focus_duration_minutes}m.")
            return # Chỉ lưu số phút chứ chưa chạy
            
        # Hỗ trợ nhận START (dùng số phút đã lưu) hoặc START:30 (ép chạy luôn 30 phút)
        if payload.startswith("START") and self.current_state == "IDLE":
            try:
                parts = payload.split(":")
                if len(parts) > 1:
                    self.focus_duration_minutes = int(parts[1])
            except ValueError:
                pass # Lỗi format thì giữ nguyên giá trị đã lưu

            self.current_state = "FOCUS"
            self.duration = self.focus_duration_minutes * 60
            self.start_time = time.time()
            print(f"*** BẮT ĐẦU CHU KỲ FOCUS ({self.focus_duration_minutes} PHÚT) ***")
            self.publish_callback(f"Bắt đầu: {self.current_state} ({self.focus_duration_minutes}m)")
            
        elif payload == "RESET":
            self.current_state = "IDLE"
            self.focus_cycles = 0
            self.publish_callback("ĐÃ RESET")
            print("*** ĐÃ RESET VỀ CHẾ ĐỘ CHỜ ***")

    def update(self):
        """Hàm này được gọi liên tục để kiểm tra thời gian"""
        if self.current_state == "IDLE":
            return # Không làm gì nếu đang ở chế độ chờ

        current_time = time.time()
        elapsed = current_time - self.start_time
        time_left = int(self.duration - elapsed)
        
        # 1. Hết giờ -> Chuyển trạng thái
        if time_left <= 0:
            if self.current_state == "FOCUS":
                self.focus_cycles += 1
                if self.focus_cycles % 4 == 0:
                    self.current_state = "LONG_BREAK"
                    # Nghỉ dài tỷ lệ thuận với tgian focus (thường gấp 3 lần nghỉ ngắn)
                    long_break_mins = max(1, int(self.focus_duration_minutes * 3 / 5))
                    self.duration = long_break_mins * 60
                else:
                    self.current_state = "SHORT_BREAK"
                    # Nghỉ ngắn tỷ lệ thuận với tgian focus (bằng 1/5)
                    short_break_mins = max(1, int(self.focus_duration_minutes / 5))
                    self.duration = short_break_mins * 60
                    
            elif self.current_state in ["SHORT_BREAK", "LONG_BREAK"]:
                self.current_state = "IDLE"
                
            self.start_time = time.time()
            
            if self.current_state != "IDLE":
                self.publish_callback(f"Bắt đầu: {self.current_state}")
            else:
                self.publish_callback("HOÀN THÀNH!")
                
        # 2. Chưa hết giờ -> Cập nhật lên Dashboard mỗi 3 giây
        else:
            if current_time - self.last_publish_time >= 3:
                mins, secs = divmod(time_left, 60)
                status_str = f"{self.current_state} - {mins:02d}:{secs:02d}" 
                print(f"Cập nhật: {status_str}")
                self.publish_callback(status_str)
                self.last_publish_time = current_time