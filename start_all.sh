#!/usr/bin/env bash
# ======================================================================
#   ⚡ TRÙM MINECRAFT (1.21.1) - KHỞI ĐỘNG SERVER & WEB ADMIN (DEDICATED/VPS)
# ======================================================================
cd "$(dirname "$0")"

mkdir -p logs

echo "======================================================================"
echo "  ⚡ TRÙM MINECRAFT (1.21.1) - DEDICATED / VPS DIRECT RUNNER"
echo "======================================================================"

# Mảng lưu PID các tiến trình nền để dọn dẹp khi tắt
BG_PIDS=()

cleanup() {
    echo ""
    echo "[*] Đang dừng Web Admin Hub..."
    for pid in "${BG_PIDS[@]}"; do
        if kill -0 "$pid" >/dev/null 2>&1; then
            kill "$pid" 2>/dev/null
        fi
    done
    echo "[*] Đã dọn dẹp xong."
}
trap cleanup EXIT INT TERM

# 1. Khởi động Web Admin Hub (Port 7868)
if command -v node >/dev/null 2>&1; then
    echo "[+] Khởi động Web Admin Hub (Port 7868)..."
    node web_admin_hub.js > logs/admin_hub.log 2>&1 &
    HUB_PID=$!
    BG_PIDS+=($HUB_PID)
    echo "    -> Web Hub đang chạy ngầm (PID: $HUB_PID, log: logs/admin_hub.log)"
    echo "    -> Quản trị trực tiếp: http://<IP_VPS>:7868"
else
    echo "[-] Cảnh báo: Chưa cài Node.js, bỏ qua Web Admin Hub."
fi

# 2. Khởi động Minecraft Server ở chế độ foreground
echo "======================================================================"
echo "  ĐANG KHỞI ĐỘNG MINECRAFT SERVER..."
echo "  (Bấm Ctrl+C để dừng server)"
echo "======================================================================"

./run.sh
