# ⚡ TRÙM MINECRAFT - Fabric 1.21.1 Hybrid Server (Arclight)

Bộ cài đặt máy chủ Minecraft tối ưu hiệu năng cao, hỗ trợ đồng thời cả **Mod Fabric** và **Plugin Spigot/Paper**, tích hợp chống cheat, chống xray, menu quản trị in-game, web dashboard và micro thoại 3D theo khoảng cách.

---

## 🛠️ Thành phần máy chủ
* **Core:** Arclight Fabric 1.21.1 (`arclight.jar`)
* **Multi-threaded Netty & Memory Optimization:** FerriteCore, Spark
* **Bảo mật & Chống gian lận:** GrimAC (Anti-Cheat 24/7), Anti-Xray Engine Mode 2 (Spigot fake ores)
* **Giao diện quản trị:** DeluxeMenus (`/admin`), VoxelDash Web Dashboard (`http://localhost:7867`), Trung Tâm Quản Trị & Tối Ưu Tự Động (`http://localhost:7868`)
* **Giao tiếp âm thanh:** Simple Voice Chat (Proximity 3D Voice Chat)
* **Quyền hạn & Tiện ích:** LuckPerms, EssentialsX, PlaceholderAPI, BetterMessages

---

## 🚀 Hướng dẫn mang đi máy tính khác chạy (Deploy Anywhere)

Khi clone hoặc copy thư mục này sang bất kỳ máy tính/laptop/VPS nào:

### 1. Yêu cầu phần mềm trên máy mới:
1. **Java 21** (Adoptium Temurin hoặc Oracle JDK 21).
2. **Node.js** (để chạy Hub quản trị & tối ưu web).
3. **Playit.gg** (để mở tunnel cho bạn bè kết nối không cần mở port modem).

### 2. Các bước khởi động:
1. Mở thư mục server:
   * Nhấp đúp vào **`run.bat`** để chạy Minecraft Server.
   * Nhấp đúp vào **`start_admin_hub.bat`** để chạy Hub Quản Trị & Tối Ưu Web (`http://localhost:7868`).
2. Cài đặt và bật ứng dụng **Playit.gg**:
   * Tạo tunnel Minecraft TCP (Port `25565`) cho game.
   * Tạo tunnel UDP (Port `24454`) cho Voice Chat (Micro).
   * Cập nhật địa chỉ UDP của Playit vào file `config/voicechat/voicechat-server.properties` tại dòng `voice_host=`.
3. Gửi địa chỉ Playit cho bạn bè cùng vào chơi!

---

## 🌐 Trung Tâm Quản Trị & Tối Ưu Web (`http://localhost:7868`)
* **Tự động bảo trì & Khởi động lại:** Cấu hình mốc giờ (VD: `04:00` sáng), có thông báo đếm ngược 60s/10s trong game, tự động lưu thế giới và kick người chơi an toàn.
* **Tự động dọn rác (ClearLag):** Tuỳ chỉnh chu kỳ dọn (VD: mỗi 15 phút), tự động phát loa đếm ngược nhắc nhở nhặt đồ trước khi xoá item rơi vãi.
* **Dọn rác & Giảm tải tức thì:** 1 click để "Dọn Rác Ngay", "Dọn Quái Quá Tải", "Giải Phóng Bộ Nhớ RAM".
* **Chế độ bảo trì (Maintenance Mode):** Bật/Tắt chế độ bảo trì ngay trên web (khoá whitelist, chỉ cho admin vào test).
* **Điều chỉnh tầm nhìn linh hoạt:** Thanh trượt View Distance và Simulation Distance giúp giảm tải CPU tức thì khi đông người chơi.
* **Kéo thả Mod & Plugin:** Upload, xóa và Bật/Tắt (.jar $\leftrightarrow$ .disabled) trực tiếp trên trình duyệt.

---

## 🎮 Các lệnh quản trị viên quan trọng
* `/admin` : Mở Menu quản trị server bằng giao diện rương trực quan.
* `/voxeldash password <mật_khẩu>` : Đặt mật khẩu đăng nhập Web Dashboard (`http://localhost:7867`).
* `/rules` hoặc `/luat` : Xem bảng nội quy máy chủ.
* Bấm phím **`V`** trong game : Cài đặt Micro Voice Chat.
