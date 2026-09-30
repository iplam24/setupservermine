#!/usr/bin/env bash
# ======================================================================
#   ⚡ ITCOM MINECRAFT (1.21.1) - LINUX SERVER RUNNER
# ======================================================================
cd "$(dirname "$0")"

# Memory Allocation (VPS has 6GB total -> 2G-4G is optimal and safe)
RAM_MIN="${RAM_MIN:-2G}"
RAM_MAX="${RAM_MAX:-4G}"

echo "======================================================================"
echo "  ⚡ ITCOM MINECRAFT SERVER (1.21.1) - UBUNTU RUNNER"
echo "======================================================================"
echo "  Allocated RAM: $RAM_MIN - $RAM_MAX"
echo "  Working Dir  : $(pwd)"
echo "======================================================================"

# Kiểm tra Java
if ! command -v java >/dev/null 2>&1; then
    echo "[-] LỖI: Chưa tìm thấy Java trên Ubuntu!"
    echo "    Cài đặt Java 21 bằng lệnh sau:"
    echo "    sudo apt update && sudo apt install -y openjdk-21-jre-headless"
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | head -n 1)
echo "[+] Phiên bản Java: $JAVA_VER"

# Vòng lặp tự động restart khi server stop (bảo trì định kỳ / reload)
# Nhấn Ctrl+C hoặc tắt script để dừng hẳn
AUTO_RESTART="${AUTO_RESTART:-true}"

while true; do
    echo "[+] Đang khởi động Arclight Fabric Server..."
    java -Xms$RAM_MIN -Xmx$RAM_MAX \
      -XX:+UseG1GC \
      -XX:+ParallelRefProcEnabled \
      -XX:MaxGCPauseMillis=200 \
      -XX:+UnlockExperimentalVMOptions \
      -XX:+DisableExplicitGC \
      -XX:+AlwaysPreTouch \
      -XX:G1NewSizePercent=30 \
      -XX:G1MaxNewSizePercent=40 \
      -XX:G1ReservePercent=20 \
      -XX:G1HeapWastePercent=5 \
      -XX:G1MixedGCCountTarget=4 \
      -XX:InitiatingHeapOccupancyPercent=15 \
      -XX:G1MixedGCLiveThresholdPercent=90 \
      -XX:G1RSetUpdatingPauseTimePercent=5 \
      -XX:SurvivorRatio=32 \
      -XX:+PerfDisableSharedMem \
      -XX:MaxTenuringThreshold=1 \
      -Dusing.aikars.flags=https://mcflags.emc.gs \
      -Daikars.new.flags=true \
      -Dfile.encoding=UTF-8 \
      -jar arclight.jar nogui

    EXIT_CODE=$?
    echo ""
    echo "======================================================================"
    echo "  Server đã dừng lại (Mã thoát: $EXIT_CODE)."

    if [ "$AUTO_RESTART" = "false" ] || [ $EXIT_CODE -eq 130 ]; then
        echo "  Dừng vòng lặp (AUTO_RESTART=false hoặc bấm Ctrl+C). Kết thúc."
        break
    fi

    echo "  Tự động khởi động lại sau 5 giây... (Nhấn Ctrl+C để hủy)"
    echo "======================================================================"
    sleep 5
done
