#!/usr/bin/env bash
# ======================================================================
#   KHỞI ĐỘNG WEB ADMIN HUB (PORT 7868) TRÊN UBUNTU / LINUX
# ======================================================================
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
    echo "[-] LỖI: Chưa cài đặt Node.js! Vui lòng cài đặt bằng lệnh:"
    echo "    sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

echo "[+] Đang khởi động Web Admin Hub trên port 7868..."
echo "[+] Truy cập nội bộ: http://localhost:7868"
exec node web_admin_hub.js
