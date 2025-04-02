@echo off
echo Starte statischen Server fuer Maklerportal...
cd %~dp0
npx --yes http-server src/main/resources/static -p 8080 --cors
pause
