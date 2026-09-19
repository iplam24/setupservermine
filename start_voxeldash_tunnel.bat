@echo off
title Cloudflare Tunnel - VoxelDash (Port 7867)
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================================
echo   DANG TAO LINK CLOUDFLARE CHO RIENG VOXELDASH (PORT 7867)
echo ======================================================================
echo.
echo   Duong link https://...trycloudflare.com se xuat hien ben duoi:
echo   COPY VA MO LINK DO TREN DIEN THOAI (KHONG GO THEM SO CONG :7867)
echo ======================================================================
echo.

where cloudflared >nul 2>nul
if %errorlevel%==0 (
    cloudflared tunnel --url http://localhost:7867
) else if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" (
    "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" tunnel --url http://localhost:7867
) else if exist "%ProgramFiles%\cloudflared\cloudflared.exe" (
    "%ProgramFiles%\cloudflared\cloudflared.exe" tunnel --url http://localhost:7867
) else (
    echo [CANH BAO] Chua cai dat cloudflared!
    pause
)
