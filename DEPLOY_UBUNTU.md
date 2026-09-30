# 🐧 HƯỚNG DẪN DEPLOY TRÙM MINECRAFT (1.21.1) LÊN UBUNTU (USER ROOT)

Tài liệu này hướng dẫn chi tiết cách chuyển đổi và vận hành toàn bộ hệ thống máy chủ Minecraft Arclight Fabric (bao gồm game, micro 3D, web quản trị và tunnel) từ Windows sang **Ubuntu (20.04 / 22.04 / 24.04 LTS)** chạy dưới tài khoản **`root`**.

---

## 📌 TỔNG QUAN: CẦN SỬA GÌ KHI SANG UBUNTU?

| Thành phần | Trên Windows | Khi sang Ubuntu (User Root) | Cần sửa gì? |
| :--- | :--- | :--- | :--- |
| **Khởi động server** | `run.bat` | `./run.sh` hoặc `./start_screen.sh` | Dùng script `.sh` (đã tạo sẵn) |
| **Java** | Oracle / Adoptium | `openjdk-21-jre-headless` | Cài Java 21 trên Ubuntu |
| **Web Admin Hub** | Node.js (Port 7868) | `nodejs` | Chạy ngầm qua script hoặc systemd |
| **Playit Tunnel** | `playitd.exe` (Windows) | Playit Linux Agent | Không chạy file `.exe`; dùng script `./start_playit.sh` |
| **Voice Chat (Mic 3D)** | UDP 24454 | UDP 24454 | **Bắt buộc mở Port UDP 24454** trên firewall |
| **Voice Host IP** | `voicechat-server.properties` | Đổi sang IP VPS hoặc Playit UDP mới | Xem hướng dẫn bên dưới |

---

## 🚀 BƯỚC 1: COPY TOÀN BỘ THƯ MỤC LÊN UBUNTU VPS

Bạn có thể dùng **WinSCP**, **FileZilla** (giao thức SFTP port 22 với user `root`), hoặc chạy lệnh từ Windows PowerShell:

```powershell
# Copy toàn bộ thư mục servermine lên thư mục /root/ trên VPS:
scp -r D:\servermine root@<IP_VPS>:/root/servermine
```

> **Lưu ý:** Các file `.exe` (`playit.exe`, `playitd.exe`) và file `.bat` không cần thiết trên Linux nhưng để lại cũng không gây lỗi.

---

## ⚡ BƯỚC 2: CÀI ĐẶT MÔI TRƯỜNG TỰ ĐỘNG

Đăng nhập SSH vào VPS với user **`root`**, di chuyển vào thư mục server:

```bash
cd /root/servermine

# Cấp quyền thực thi và chạy script cài đặt tự động:
chmod +x setup_ubuntu.sh
./setup_ubuntu.sh
```

Script này chạy trực tiếp dưới quyền `root` và sẽ tự động:
1. Cài đặt **Java 21 (OpenJDK 21)**.
2. Cài đặt **Node.js (LTS)** cho Web Admin Hub.
3. Cài đặt **screen** (để giữ server chạy 24/7 khi tắt SSH).
4. Cấu hình tường lửa UFW:
   - `22/tcp` (SSH - bảo đảm không bị khóa kết nối)
   - `25565/tcp` & `25565/udp` (Minecraft Server)
   - `24454/udp` (Simple Voice Chat - Micro đàm thoại 3D)
   - `7868/tcp` (Web Admin Hub)
   - `7867/tcp` (VoxelDash)
5. Cấp quyền thực thi (`chmod +x`) cho toàn bộ script `.sh`.

---

## ⚙️ BƯỚC 3: CẤU HÌNH CẦN KIỂM TRA

### 1. Dung lượng RAM (`run.sh`)
Mở file `run.sh` để kiểm tra RAM cho phù hợp với gói VPS:
```bash
nano run.sh
```
- Nếu VPS 8GB RAM: `RAM_MIN="4G"`, `RAM_MAX="6G"`.
- Nếu VPS 4GB RAM: `RAM_MIN="2G"`, `RAM_MAX="3G"`.
- Nếu VPS 16GB RAM: `RAM_MIN="6G"`, `RAM_MAX="10G"`.

*(Bấm `Ctrl + O` rồi `Enter` để lưu, `Ctrl + X` để thoát nano).*

### 2. Cấu hình Voice Chat (`config/voicechat/voicechat-server.properties`)
Mở file cấu hình Voice Chat:
```bash
nano config/voicechat/voicechat-server.properties
```
Tìm dòng `voice_host=`:
- **Nếu VPS có IP Public (mở port trực tiếp - Khuyên dùng):**
  - Đổi thành: `voice_host=<IP_CỦA_VPS>:24454`
  - Đảm bảo trên trang quản lý Cloud (Oracle, AWS, DigitalOcean, OVH...) đã mở Inbound Security Rule: **UDP port 24454**.
- **Nếu tiếp tục dùng Playit.gg:**
  - Giữ nguyên cơ chế tunnel UDP của Playit và cập nhật địa chỉ UDP của Playit vào dòng này.

---

## 🎮 BƯỚC 4: KHỞI ĐỘNG SERVER

Bạn có 2 cách chạy phổ biến nhất trên Ubuntu:

### Cách A: Chạy bằng Systemd Service (Khuyên dùng cho Root - Bền bỉ nhất)
Chạy script cài đặt tự động đã được cấu hình sẵn cho `root`:
```bash
chmod +x setup_systemd.sh
./setup_systemd.sh
```
Script sẽ tự động đăng ký 2 dịch vụ hệ thống:
- `minecraft.service` (Server game Minecraft Fabric 1.21.1)
- `minecraft-admin.service` (Web Admin Hub Port 7868)

Server sẽ **tự động bật khi VPS khởi động lại** và **tự phục hồi nếu crash**.

**Các lệnh quản trị:**
```bash
# Khởi động dịch vụ:
systemctl start minecraft
systemctl start minecraft-admin

# Xem log trực tiếp (live console):
journalctl -u minecraft -f
journalctl -u minecraft-admin -f

# Dừng hoặc khởi động lại:
systemctl stop minecraft
systemctl restart minecraft
```

---

### Cách B: Chạy qua Screen (Để trực tiếp gõ lệnh console in-game)
Nếu bạn muốn có một cửa sổ console Minecraft để trực tiếp gõ lệnh op, whitelist, gamemode...:

```bash
./start_screen.sh
```
- **Để vào lại màn hình console server:**
  ```bash
  screen -r minecraft
  ```
- **Để thoát ra ngoài terminal mà KHÔNG tắt server:**
  Bấm tổ hợp phím: `Ctrl + A` rồi thả ra và bấm phím `D` (Detach).
- **Xem log Web Hub:**
  ```bash
  tail -f logs/admin_hub.log
  ```

---

## 🌐 BƯỚC 5: KẾT NỐI VÀ QUẢN TRỊ

1. **Vào game Minecraft:**
   - IP kết nối: `<IP_VPS>:25565`
2. **Web Admin Hub:**
   - Truy cập trình duyệt: `http://<IP_VPS>:7868`
   - Quản lý ClearLag, lịch bảo trì tự động, điều chỉnh tầm nhìn (view distance), kéo thả bật/tắt mod/plugin.
3. **Micro thoại Voice Chat:**
   - Vào game bấm phím `V` để kiểm tra micro và loa.
