#!/usr/bin/env bash
# ======================================================================
#   KHỞI ĐỘNG CLOUDFLARE WEB TUNNEL (PORT 7868) TRÊN UBUNTU / LINUX
# ======================================================================
cd "$(dirname "$0")"

CLOUDFLARED_BIN=""

if command -v cloudflared >/dev/null 2>&1; then
    CLOUDFLARED_BIN="cloudflared"
elif [ -f "./cloudflared" ]; then
    chmod +x ./cloudflared
    CLOUDFLARED_BIN="./cloudflared"
fi

if [ -z "$CLOUDFLARED_BIN" ]; then
    echo "======================================================================"
    echo "  [CLOUDFLARED] Chưa tìm thấy cloudflared trên máy Ubuntu!"
    echo "  Để cài đặt cloudflared trên Ubuntu:"
    echo "  sudo mkdir -p --mode=0755 /etc/apt/keyrings"
    echo "  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /etc/apt/keyrings/cloudflare-main.gpg >/dev/null"
    echo "  echo 'deb [signed-by=/etc/apt/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | sudo tee /etc/apt/sources.list.d/cloudflared.list"
    echo "  sudo apt update && sudo apt install -y cloudflared"
    echo "======================================================================"
    exit 1
fi

echo "[+] Khởi động Cloudflare Tunnel trỏ về http://localhost:7868..."
exec "$CLOUDFLARED_BIN" tunnel --url http://localhost:7868
