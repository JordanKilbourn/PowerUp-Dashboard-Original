@echo off

cd /d "C:\Users\jordan.kilbourn\OneDrive - PlayPower.com\Desktop\PowerUp-Dashboard"

:: Stage all changes
git add .

:: Create a timestamped commit message
for /f %%i in ('powershell -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set datetime=%%i
git commit -m "Automated update %datetime%"

:: Push to main branch
git push origin main

echo.
echo ✅ Changes pushed to GitHub.
pause
