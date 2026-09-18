@echo off
title Cloudflare Web Tunnel (Remote Admin Hub)
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================================
echo   DANG KHOI TAO LINK QUAN TRI TU XA (MIEN PHI 100% QUA CLOUDFLARE)
echo ======================================================================
echo.
echo  Duong link https://...trycloudflare.com se xuat hien ngay ben duoi:
echo  Ban chi can copy link do va mo tren dien thoai hoac laptop o nha!
echo ======================================================================
echo.

where cloudflared >nul 2>nul
if %errorlevel%==0 (
    cloudflared tunnel --url http://localhost:7868
) else if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" (
    "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" tunnel --url http://localhost:7868
) else if exist "%ProgramFiles%\cloudflared\cloudflared.exe" (
    "%ProgramFiles%\cloudflared\cloudflared.exe" tunnel --url http://localhost:7868
) else (
    echo [CANH BAO] Chua cai dat cloudflared tren may nay!
    echo Hay mo CMD/PowerShell va go lenh sau de cai dat mien phi:
    echo winget install Cloudflare.cloudflared
    pause
)
