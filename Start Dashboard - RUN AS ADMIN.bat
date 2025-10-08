@echo off

:: Section 1: Administrator Check
::-------------------------------------
echo Checking for administrator permissions...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Success: Running with administrator privileges.
) else (
    echo Failure: Administrator privileges not found.
    echo Attempting to re-launch with elevated permissions...
    
    :: ✅ FIX: Use the full, direct path to PowerShell to avoid PATH issues.
    %SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe Start-Process -FilePath "%~f0" -Verb RunAs

    :: Check if the PowerShell re-launch command failed.
    if %errorLevel% NEQ 0 (
        echo.
        echo *****************************************************************
        echo  ERROR: Failed to elevate. This can happen if you click "No"
        echo  on the permission prompt or if scripts are disabled.
        echo.
        echo  Please try right-clicking the file and selecting
        echo  'Run as administrator' manually.
        echo *****************************************************************
        echo.
        pause
    )
    exit
)
::-------------------------------------

TITLE GodlyHeroes Server Dashboard

REM --- IMPORTANT ---
REM Replace 'YourUser' with your actual Windows username below.
set DASHBOARD_PATH="C:\Users\vulca\Desktop\ServerDashboard"

echo.
echo ===================================
echo  GodlyHeroes Server Dashboard
echo ===================================
echo.
echo Changing directory to:
echo %DASHBOARD_PATH%
echo.

cd /d %DASHBOARD_PATH%

echo Starting the dashboard with 'npm start'...
echo This will build the React app and then launch the backend server.
echo.

npm start

:: Check if the npm command failed and pause if it did.
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo **************************************************
    echo  The 'npm start' command failed. See error above.
    echo **************************************************
    echo.
    pause
    exit
)

echo.
echo The dashboard process has ended.
pause

