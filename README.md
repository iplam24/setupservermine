# ⚡ TRÙM MINECRAFT - Fabric 1.21.1 Hybrid Server (Arclight)

Bộ cài đặt máy chủ Minecraft tối ưu hiệu năng cao, hỗ trợ đồng thời cả **Mod Fabric** và **Plugin Spigot/Paper**, tích hợp chống cheat, chống xray, menu quản trị in-game, web dashboard và micro thoại 3D theo khoảng cách.

---

## 🛠️ Thành phần máy chủ
* **Core:** Arclight Fabric 1.21.1 (`arclight.jar`)
* **Multi-threaded Netty & Memory Optimization:** FerriteCore, Spark
* **Bảo mật & Chống gian lận:** GrimAC (Anti-Cheat 24/7), Anti-Xray Engine Mode 2 (Spigot fake ores)
* **Giao diện quản trị:** DeluxeMenus (`/admin`), VoxelDash Web Dashboard (`http://localhost:7867`)
* **Giao tiếp âm thanh:** Simple Voice Chat (Proximity 3D Voice Chat)
* **Quyền hạn & Tiện ích:** LuckPerms, EssentialsX, PlaceholderAPI, BetterMessages

---

## 🚀 Hướng dẫn mang đi máy tính khác chạy (Deploy Anywhere)

Khi clone hoặc copy thư mục này sang bất kỳ máy tính/laptop/VPS nào:

### 1. Yêu cầu phần mềm trên máy mới:
1. **Java 21** (Adoptium Temurin hoặc Oracle JDK 21).
2. **Playit.gg** (để mở tunnel cho bạn bè kết nối không cần mở port modem).

### 2. Các bước khởi động:
1. Mở thư mục server, nhấp đúp vào **`run.bat`** (hoặc chạy lệnh `java -Xms2G -Xmx4G -jar arclight.jar nogui`).
   * *Lần đầu chạy, Arclight sẽ tự động tải các thư viện thiếu (libraries) về máy.*
2. Cài đặt và bật ứng dụng **Playit.gg**:
   * Tạo tunnel Minecraft TCP (Port `25565`) cho game.
   * Tạo tunnel UDP (Port `24454`) cho Voice Chat (Micro).
   * Cập nhật địa chỉ UDP của Playit vào file `config/voicechat/voicechat-server.properties` tại dòng `voice_host=`.
3. Gửi địa chỉ Playit cho bạn bè cùng vào chơi!

---

## 🎮 Các lệnh quản trị viên quan trọng
* `/admin` : Mở Menu quản trị server bằng giao diện rương trực quan.
* `/voxeldash password <mật_khẩu>` : Đặt mật khẩu đăng nhập Web Dashboard (`http://localhost:7867`).
* `/rules` hoặc `/luat` : Xem bảng nội quy máy chủ.
* Bấm phím **`V`** trong game : Cài đặt Micro Voice Chat.
