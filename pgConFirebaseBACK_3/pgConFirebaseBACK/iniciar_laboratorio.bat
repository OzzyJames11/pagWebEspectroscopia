@echo off
echo ===================================================
echo [PASO 1] Limpiando procesos de Node.js (Zombies)...
echo ===================================================
taskkill /f /im node.exe >nul 2>&1

:: Esperamos 2 segundos para que Windows libere correctamente los puertos COM (USB)
timeout /t 2 >nul

echo.
echo ===================================================
echo [PASO 2] Iniciando el Watchdog maestro...
echo ===================================================
:: Nos ubicamos en la carpeta EXACTA donde vive el watchdog
cd "C:\Users\Administrador\Documents\james\watchdog"

:: Encendemos el Watchdog
node watchdog.js

:: El pause sirve por si el Watchdog crashea y se cierra, la ventana se quedará abierta
pause