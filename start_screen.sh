#!/usr/bin/env bash
# ======================================================================
#   ITCOM MINECRAFT SERVER - GNU SCREEN RUNNER (24/7 BACKGROUND)
# ======================================================================
cd "$(dirname "$0")"

SESSION_NAME="itcom"

if ! command -v screen >/dev/null 2>&1; then
    echo "[-] Chưa cài đặt 'screen'! Cài đặt bằng lệnh:"
    echo "    sudo apt update && sudo apt install -y screen"
    exit 1
fi

# Kiểm tra xem session đã chạy chưa
if screen -list | grep -q "\.${SESSION_NAME}[[:space:]]"; then
    echo "[!] Session '$SESSION_NAME' đang chạy!"
    echo "    Đang kết nối vào console server (bấm Ctrl+A rồi bấm D để thoát ra mà không tắt server)..."
    sleep 2
    screen -r "$SESSION_NAME"
else
    echo "[+] Đang khởi tạo session screen mới có tên '$SESSION_NAME'..."
    screen -dmS "$SESSION_NAME" bash -c "./start_all.sh"
    echo "======================================================================"
    echo "  [THÀNH CÔNG] Server đang chạy nền trong Screen Session '$SESSION_NAME'!"
    echo "======================================================================"
    echo "  * Để xem console server : screen -r $SESSION_NAME"
    echo "  * Để thoát màn hình     : Bấm tổ hợp phím [Ctrl + A] rồi bấm phím [D]"
    echo "  * Để xem log web hub    : tail -f logs/admin_hub.log"
    echo "  * Để xem log minecraft  : tail -f logs/latest.log"
    echo "======================================================================"
fi
