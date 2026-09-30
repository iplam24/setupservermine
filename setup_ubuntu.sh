#!/usr/bin/env bash
# ======================================================================
#   ⚡ ITCOM MINECRAFT SERVER - UBUNTU ENVIRONMENT SETUP
# ======================================================================
set -e

echo "======================================================================"
echo "  ⚡ ITCOM MINECRAFT SERVER - UBUNTU SETUP (JAVA 21, NODE.JS, FIREWALL)"
echo "======================================================================"

# Kiểm tra quyền root / sudo
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

echo "[1/5] Cập nhật danh sách gói hệ thống..."
$SUDO apt update -y

echo "[2/5] Cài đặt các công cụ cơ bản (curl, wget, screen, ufw, git)..."
$SUDO apt install -y curl wget screen ufw git software-properties-common

echo "[3/5] Cài đặt Java 21 (OpenJDK 21)..."
$SUDO apt install -y openjdk-21-jre-headless

echo "[4/5] Cài đặt Node.js (LTS)..."
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO apt install -y nodejs
else
    echo "    Node.js đã được cài đặt: $(node -v)"
fi

echo "[5/5] Cấp quyền thực thi cho các file script (.sh)..."
cd "$(dirname "$0")"
chmod +x *.sh

echo "======================================================================"
echo "  CẤU HÌNH TƯỜNG LỬA (UFW FIREWALL)"
echo "======================================================================"
read -p "Bạn có muốn mở các port tường lửa (22, 25565, 24454, 7868, 7867) ngay không? [y/N]: " OPEN_UFW
if [[ "$OPEN_UFW" =~ ^[Yy]$ ]]; then
    $SUDO ufw allow 22/tcp comment 'SSH'
    $SUDO ufw allow 25565/tcp comment 'Minecraft Game'
    $SUDO ufw allow 25565/udp comment 'Minecraft UDP'
    $SUDO ufw allow 24454/udp comment 'Simple Voice Chat UDP'
    $SUDO ufw allow 7868/tcp comment 'Web Admin Hub'
    $SUDO ufw allow 7867/tcp comment 'VoxelDash'
    $SUDO ufw --force enable
    echo "[+] Đã mở các port tường lửa cần thiết và kích hoạt UFW!"
fi

echo ""
echo "======================================================================"
echo "  ✅ HOÀN TẤT THIẾT LẬP MÔI TRƯỜNG!"
echo "======================================================================"
echo "  - Java version   : $(java -version 2>&1 | head -n 1)"
echo "  - Node version   : $(node -v)"
echo ""
echo "  Để bắt đầu chạy server không lo tắt khi đóng SSH:"
echo "    ./start_screen.sh"
echo "======================================================================"
