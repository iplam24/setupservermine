@echo off
title Arclight Fabric Server [1.21.1]
chcp 65001 > nul
cd /d "%~dp0"

:: Cau hinh dung luong RAM (mac dinh 4G - 6G, co the sua thanh 8G hoac 12G)
set RAM_MIN=4G
set RAM_MAX=6G

echo ======================================================================
echo   ⚡ TRÙM MINECRAFT (1.21.1) - KHOI DONG HE THONG ALL-IN-ONE
echo ======================================================================
echo   RAM cap phat: %RAM_MIN% - %RAM_MAX%
echo   Dang tu dong khoi chay Web Admin Hub & Tunnel...
echo ======================================================================

:: 1. Tu dong bat Web Admin Hub (Port 7868)
where node >nul 2>nul
if %errorlevel%==0 (
    start "Admin Control Hub [Port 7868]" /min cmd /c "node web_admin_hub.js"
    echo   [+] Da bat Hub Quan Tri: http://localhost:7868
) else (
    echo   [-] Khong tim thay Node.js. Hub Quan Tri chua the khoi dong.
)

:: 2. Tu dong bat Cloudflare Web Tunnel de lay link tu xa (thu nho xuong taskbar)
if exist "start_web_tunnel.bat" (
    start "Cloudflare Web Tunnel (Remote Admin)" /min cmd /c "start_web_tunnel.bat"
    echo   [+] Da mo Cloudflare Tunnel de lay link quan tri tu xa
)

:: 3. Tu dong bat Playit Game Tunnel (mo ket noi Minecraft va Micro ra ngoai internet)
if exist "playitd.exe" (
    start "Playit Game Tunnel" /min cmd /c "playitd.exe --secret-path playit.toml"
    echo   [+] Da bat Playit Tunnel (expressing-actress.tun.ply.gg:23281)
)


echo ======================================================================
echo   DANG KHOI DONG SERVER MINECRAFT...
echo ======================================================================

java -Xms%RAM_MIN% -Xmx%RAM_MAX% ^
  -XX:+UseG1GC ^
  -XX:+ParallelRefProcEnabled ^
  -XX:MaxGCPauseMillis=200 ^
  -XX:+UnlockExperimentalVMOptions ^
  -XX:+DisableExplicitGC ^
  -XX:+AlwaysPreTouch ^
  -XX:G1NewSizePercent=30 ^
  -XX:G1MaxNewSizePercent=40 ^
  -XX:G1ReservePercent=20 ^
  -XX:G1HeapWastePercent=5 ^
  -XX:G1MixedGCCountTarget=4 ^
  -XX:InitiatingHeapOccupancyPercent=15 ^
  -XX:G1MixedGCLiveThresholdPercent=90 ^
  -XX:G1RSetUpdatingPauseTimePercent=5 ^
  -XX:SurvivorRatio=32 ^
  -XX:+PerfDisableSharedMem ^
  -XX:MaxTenuringThreshold=1 ^
  -Dusing.aikars.flags=https://mcflags.emc.gs ^
  -Daikars.new.flags=true ^
  -Dfile.encoding=UTF-8 ^
  -jar arclight.jar nogui

echo.
echo ======================================================================
echo   Server da dung lai. Nhan phim bat ky de thoat...
echo ======================================================================
pause > nul
