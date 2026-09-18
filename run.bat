@echo off
title Arclight Fabric Server [1.21.1]
chcp 65001 > nul
cd /d "%~dp0"

:: Cau hinh dung luong RAM (mac dinh 4G - 6G, co the sua thanh 8G hoac 12G)
set RAM_MIN=4G
set RAM_MAX=6G

echo ======================================================================
echo   DANG KHOI DONG MINECRAFT ARCLIGHT FABRIC SERVER (1.21.1)
echo   RAM cap phat: %RAM_MIN% - %RAM_MAX%
echo   Che do toi uu: G1GC Aikar + Paper Async Chunks + Krypton Multi-thread
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
echo Server da dung lai. Nhan phim bat ky de thoat...
pause > nul
