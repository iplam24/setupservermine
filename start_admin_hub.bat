@echo off
title Minecraft Admin Control Hub
chcp 65001 > nul
cd /d "%~dp0"

echo ======================================================================
echo   DANG KHOI DONG TRUNG TAM QUAN TRI & TOI UU (PORT 7868)
echo ======================================================================

node web_admin_hub.js
pause
