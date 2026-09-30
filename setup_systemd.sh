#!/usr/bin/env bash
# ======================================================================
#   TỰ ĐỘNG CÀI ĐẶT SYSTEMD SERVICES CHO ROOT TRÊN UBUNTU
# ======================================================================
set -e
cd "$(dirname "$0")"

CURRENT_DIR="$(pwd)"
CURRENT_USER="$(whoami)"

echo "======================================================================"
echo "  CÀI ĐẶT DỊCH VỤ HỆ THỐNG SYSTEMD (TỰ BẬT KHI KHỞI ĐỘNG VPS)"
echo "======================================================================"
echo "  User       : $CURRENT_USER"
echo "  Thư mục    : $CURRENT_DIR"
echo "======================================================================"

JAVA_BIN="$(command -v java || echo /usr/bin/java)"
NODE_BIN="$(command -v node || echo /usr/bin/node)"

# Tạo file minecraft.service động theo thư mục thực tế
cat <<EOF > /etc/systemd/system/minecraft.service
[Unit]
Description=ITCOM Minecraft Fabric Server (1.21.1)
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$JAVA_BIN -Xms2G -Xmx4G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true -Dfile.encoding=UTF-8 -jar arclight.jar nogui
Restart=always
RestartSec=5s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

# Tạo file minecraft-admin.service động
cat <<EOF > /etc/systemd/system/minecraft-admin.service
[Unit]
Description=ITCOM Minecraft Web Admin Hub (Port 7868)
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$NODE_BIN web_admin_hub.js
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable minecraft
systemctl enable minecraft-admin

echo ""
echo "[+] Đã cài đặt và kích hoạt (enable) 2 service thành công!"
echo ""
echo "Các lệnh điều khiển:"
echo "  - Bật server ngay        : systemctl start minecraft"
echo "  - Bật web admin ngay     : systemctl start minecraft-admin"
echo "  - Xem log server trực tiếp: journalctl -u minecraft -f"
echo "  - Xem log web admin      : journalctl -u minecraft-admin -f"
echo "  - Dừng server            : systemctl stop minecraft"
echo "  - Khởi động lại server   : systemctl restart minecraft"
echo "======================================================================"
