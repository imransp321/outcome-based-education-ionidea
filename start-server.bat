@echo off
echo Starting OBE System Server...
cd /d "%~dp0server"
node index.js
pause
