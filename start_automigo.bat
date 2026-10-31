@echo off
title Automigo v5 Launcher & Background Runner
color 0A
cls
echo ================================================================
echo               AUTOMIGO v5 1-CLICK BACKGROUND LAUNCHER
echo ================================================================
echo.

echo [*] Checking AI Backend Availability...

:: 1. Check OmniRoute
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = [System.Net.WebRequest]::Create('http://127.0.0.1:20128/v1/models'); $r.Timeout = 1500; $resp = $r.GetResponse(); exit 0 } catch { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Local OmniRoute AI is active (Port 20128)!
    goto launch_browser
)

:: 2. Check Ollama
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = [System.Net.WebRequest]::Create('http://localhost:11434/api/tags'); $r.Timeout = 1500; $resp = $r.GetResponse(); exit 0 } catch { exit 1 }"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Local Ollama AI is active (Port 11434)!
    goto launch_browser
)

:: 3. Neither local backend detected; try starting OmniRoute if installed
if exist "%APPDATA%\npm\omniroute.cmd" (
    echo [*] Starting OmniRoute in background...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%APPDATA%\npm\omniroute.cmd' -ArgumentList 'serve' -WindowStyle Minimized"
    echo [*] Waiting for OmniRoute to initialize models...
    set /a attempts=0
    :wait_loop
    set /a attempts+=1
    if %attempts% GTR 15 (
        echo [!] OmniRoute is starting slowly or not configured.
        goto launch_browser
    )
    <nul set /p=.
    timeout /t 1 /nobreak >nul
    powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = [System.Net.WebRequest]::Create('http://127.0.0.1:20128/v1/models'); $r.Timeout = 1500; $resp = $r.GetResponse(); exit 0 } catch { exit 1 }"
    if %ERRORLEVEL% NEQ 0 goto wait_loop
    echo.
    echo [OK] OmniRoute AI is ready!
) else (
    echo [NOTE] No local AI running. You can configure any Cloud AI (NVIDIA NIM,
    echo        Groq, Gemini, OpenRouter) via the Automigo extension icon in Chrome!
)

:launch_browser
echo.
echo [*] Opening Amigo LMS...

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_PATH_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set BRAVE_PATH="%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe"

if exist %CHROME_PATH% (
    start "" %CHROME_PATH% "https://amigo.amityonline.com"
) else if exist %CHROME_PATH_X86% (
    start "" %CHROME_PATH_X86% "https://amigo.amityonline.com"
) else if exist %BRAVE_PATH% (
    start "" %BRAVE_PATH% "https://amigo.amityonline.com"
) else (
    start "" "https://amigo.amityonline.com"
)

echo.
echo ================================================================
echo   [SUCCESS] Automigo is Ready!
echo   * Multi-provider AI support (Ollama, NVIDIA NIM, Groq, Gemini, OmniRoute).
echo   * Background Keep-Alive is ACTIVE in the extension.
echo   * Safe to run in background while watching videos or playing games.
echo ================================================================
echo Closing this launcher window in 4 seconds...
timeout /t 4 /nobreak >nul
exit
