@echo off
title Playit.gg Tunnel Agent
cd /d "%~dp0playit"

echo ======================================================================
echo   HUONG DAN KET NOI PLAYIT.GG (BYPASS IPV4 / CGNAT)
echo ======================================================================
echo  1. Mo trinh duyet vao: https://playit.gg/manage/agents
echo  2. Bam "Add Agent" -> Chon "Custom" -> Copy doan Secret Key duoc cap.
echo  3. Chay lenh: playit.exe --secret <SECRET_KEY_CUA_BAN>
echo  4. Sau do tren web Playit bam "Add Tunnel" -> Minecraft Java -> Port 25565.
echo  5. Gui dia chi IP (vi du: ten-ban.joinmc.link) cho ban be vao choi!
echo ======================================================================
echo.

if exist "%LOCALAPPDATA%\Microsoft\WinGet\Packages\DevelopedMethods.playit_Microsoft.Winget.Source_8wekyb3d8bbwe\playit.exe" (
    "%LOCALAPPDATA%\Microsoft\WinGet\Packages\DevelopedMethods.playit_Microsoft.Winget.Source_8wekyb3d8bbwe\playit.exe"
) else (
    playit.exe
)
pause
