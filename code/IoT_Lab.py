import sys
import time
from Adafruit_IO import MQTTClient

# Nhúng Class Pomodoro từ file pomodoro.py
from pomodoro import PomodoroTimer

AIO_USERNAME = "vuducbinhan08052005"
AIO_KEY = "aio_EXYS93MQ8r0bb5AY5nHG8whUJ6OP"

FEED_CONTROL = "pomodoro-control"
FEED_STATUS = "pomodoro-status"

# --- KHỞI TẠO POMODORO ---
# Tạo một hàm trung gian để Pomodoro có thể gọi khi cần đẩy dữ liệu lên web
def publish_status(status_str):
    client.publish(FEED_STATUS, status_str)

# Khởi tạo đối tượng pomodoro và truyền hàm publish_status vào
pomodoro = PomodoroTimer(publish_callback=publish_status)

def connected(client):
    print("Ket noi thanh cong ...")
    client.subscribe(FEED_CONTROL)

def subscribe(client , userdata , mid , granted_qos):
    print("Subscribe thanh cong ...")

def disconnected(client):
    print("Ngat ket noi ...")
    sys.exit (1)

def message(client, feed_id, payload):
    print(f"--> Nhan du lieu: [{payload}] tu feed: {feed_id}")
    # Nếu nhận tín hiệu từ web, đẩy tín hiệu đó vào class Pomodoro để xử lý
    if feed_id == FEED_CONTROL:
        pomodoro.handle_command(payload)

client = MQTTClient(AIO_USERNAME , AIO_KEY)
client.on_connect = connected
client.on_disconnect = disconnected
client.on_message = message
client.on_subscribe = subscribe
client.connect()
client.loop_background()

while True:
    pomodoro.update() # Gọi hàm update liên tục để đếm giờ
    time.sleep(1)     # Ngủ 1 giây để tiết kiệm tài nguyên