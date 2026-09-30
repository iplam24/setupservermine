#!/usr/bin/env bash
# ======================================================================
#   KHỞI ĐỘNG PLAYIT.GG TUNNEL TRÊN UBUNTU / LINUX
# ======================================================================
cd "$(dirname "$0")"

PLAYIT_BIN=""

if command -v playit >/dev/null 2>&1; then
    PLAYIT_BIN="playit"
elif [ -f "./playit" ]; then
    chmod +x ./playit
    PLAYIT_BIN="./playit"
fi

if [ -z "$PLAYIT_BIN" ]; then
    echo "======================================================================"
    echo "  [PLAYIT.GG] Chưa tìm thấy Playit trên máy Ubuntu!"
    echo "  Đang tự động tải Playit Linux amd64..."
    echo "======================================================================"
    
    ARCH=$(uname -m)
    DOWNLOAD_URL="https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64"
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        DOWNLOAD_URL="https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-arm64"
    fi

    if curl -SsL -o ./playit "$DOWNLOAD_URL"; then
        chmod +x ./playit
        PLAYIT_BIN="./playit"
        echo "[+] Tải Playit thành công!"
    else
        echo "[-] Tải thất bại. Vui lòng cài Playit qua apt hoặc tải thủ công:"
        echo "    curl -SsL https://playit-cloud.github.io/ppa/key.gpg | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/playit.gpg >/dev/null"
        echo "    echo \"deb [signed-by=/etc/apt/trusted.gpg.d/playit.gpg] https://playit-cloud.github.io/ppa/data ./\" | sudo tee /etc/apt/sources.list.d/playit.list"
        echo "    sudo apt update && sudo apt install -y playit"
        exit 1
    fi
fi

echo "[+] Khởi chạy Playit Tunnel với cấu hình: playit.toml"
exec "$PLAYIT_BIN" --secret-path playit.toml
