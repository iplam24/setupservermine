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

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:7868
pause
