@echo off
setlocal EnableDelayedExpansion

title Amrita Student Companion - Installer
color 0F

echo ==============================================================================
echo                 [A] Amrita Student Companion - Easy Installer
echo ==============================================================================
echo  A privacy-focused academic dashboard and class-skip calculator.
echo  This script will download the latest version and help you load it in Chrome.
echo ==============================================================================
echo.

REM -----------------------------------------------------------------------------
REM Step 1: Determine GitHub Repository URL
REM -----------------------------------------------------------------------------
set "DEFAULT_REPO=https://github.com/phant0mZY/AUMextension"
set "REPO_URL=%DEFAULT_REPO%"

echo [1/6] GitHub Repository Configuration
echo ------------------------------------------------------------------------------
echo Default Repository: %DEFAULT_REPO%
echo.
set "USER_INPUT="
set /p "USER_INPUT=Enter repository URL [Press ENTER to use default]: "

REM Strip leading/trailing spaces
for /f "tokens=* delims= " %%A in ("!USER_INPUT!") do set "USER_INPUT=%%A"

if not "!USER_INPUT!"=="" set "REPO_URL=!USER_INPUT!"

REM Strip trailing slashes or .git suffix if present
if "!REPO_URL:~-4!"==".git" set "REPO_URL=!REPO_URL:~0,-4!"
if "!REPO_URL:~-1!"=="/" set "REPO_URL=!REPO_URL:~0,-1!"

set "ZIP_URL=!REPO_URL!/archive/refs/heads/main.zip"
set "FALLBACK_ZIP_URL=!REPO_URL!/archive/refs/heads/master.zip"

echo.
echo Target Repository : !REPO_URL!
echo Download URL      : !ZIP_URL!
echo.

REM -----------------------------------------------------------------------------
REM Step 2: Download Extension Archive
REM -----------------------------------------------------------------------------
echo [2/6] Downloading latest release from GitHub...
echo ------------------------------------------------------------------------------
set "TEMP_ZIP=%TEMP%\AmritaStudentCompanion_latest.zip"
if exist "!TEMP_ZIP!" del /f /q "!TEMP_ZIP!" >nul 2>&1

where curl.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto :download_powershell

:download_curl
echo Downloading archive via Windows curl...
curl.exe -L -f --progress-bar -o "!TEMP_ZIP!" "!ZIP_URL!"
if exist "!TEMP_ZIP!" goto :download_validate

echo Main branch download failed. Trying master branch...
curl.exe -L -f --progress-bar -o "!TEMP_ZIP!" "!FALLBACK_ZIP_URL!"
goto :download_validate

:download_powershell
echo Downloading archive via PowerShell...
powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri '!ZIP_URL!' -OutFile '!TEMP_ZIP!' -UseBasicParsing } catch { Invoke-WebRequest -Uri '!FALLBACK_ZIP_URL!' -OutFile '!TEMP_ZIP!' -UseBasicParsing }"

:download_validate
if not exist "!TEMP_ZIP!" goto :download_error

set "ZIP_SIZE=0"
for %%A in ("!TEMP_ZIP!") do set "ZIP_SIZE=%%~zA"
if !ZIP_SIZE! LEQ 0 goto :download_error

echo Download completed successfully (!ZIP_SIZE! bytes).
echo.
goto :extract_step

:download_error
echo.
echo [ERROR] Download failed or file is empty!
echo Could not download from: !REPO_URL!
echo.
echo Please verify:
echo  1. Your internet connection is active.
echo  2. The GitHub repository exists and is accessible.
echo.
if exist "!TEMP_ZIP!" del /f /q "!TEMP_ZIP!" >nul 2>&1
pause
exit /b 1

REM -----------------------------------------------------------------------------
REM Step 3: Extract to %LOCALAPPDATA%\AmritaStudentCompanion
REM -----------------------------------------------------------------------------
:extract_step
set "TARGET_BASE=%LOCALAPPDATA%\AmritaStudentCompanion"
echo [3/6] Installing extension files...
echo ------------------------------------------------------------------------------
echo Target directory: !TARGET_BASE!

if exist "!TARGET_BASE!" (
    echo Replacing previous installation safely...
    rd /s /q "!TARGET_BASE!" >nul 2>&1
)

mkdir "!TARGET_BASE!" >nul 2>&1

where tar.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto :extract_powershell

echo Extracting archive using Windows tar...
tar.exe -xf "!TEMP_ZIP!" -C "!TARGET_BASE!"
goto :extract_finish

:extract_powershell
echo Extracting archive using PowerShell...
powershell -NoProfile -Command "Expand-Archive -Path '!TEMP_ZIP!' -DestinationPath '!TARGET_BASE!' -Force"

:extract_finish
del /f /q "!TEMP_ZIP!" >nul 2>&1

REM -----------------------------------------------------------------------------
REM Step 4: Locate Exact Directory Containing manifest.json
REM -----------------------------------------------------------------------------
echo.
echo [4/6] Verifying extension structure...
echo ------------------------------------------------------------------------------

set "MANIFEST_PATH="
set "EXTENSION_DIR="

for /r "!TARGET_BASE!" %%F in (manifest.json) do (
    if exist "%%F" (
        set "MANIFEST_PATH=%%F"
        set "EXTENSION_DIR=%%~dpF"
        goto :manifest_found
    )
)

:manifest_found
if "!EXTENSION_DIR!"=="" (
    echo.
    echo [ERROR] manifest.json was not found inside the extracted files!
    echo Extraction directory: !TARGET_BASE!
    echo.
    echo Note: If this is your repository and you haven't pushed your local extension
    echo files to GitHub yet, please push them first:
    echo   git add .
    echo   git commit -m "Add Amrita Companion extension files"
    echo   git push origin main
    echo.
    echo Then re-run this installer!
    pause
    exit /b 1
)

if "!EXTENSION_DIR:~-1!"=="\" set "EXTENSION_DIR=!EXTENSION_DIR:~0,-1!"

echo Manifest located at: !MANIFEST_PATH!
echo Extension folder   : !EXTENSION_DIR!
echo.

echo|set /p="!EXTENSION_DIR!"|clip
echo [COPIED] Extension folder path has been automatically copied to clipboard!
echo.

REM -----------------------------------------------------------------------------
REM Step 5: Launch Chrome and Open Explorer
REM -----------------------------------------------------------------------------
echo [5/6] Opening Chrome Extensions and File Explorer...
echo ------------------------------------------------------------------------------

start "" explorer.exe "!EXTENSION_DIR!"

set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_EXE=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

if defined CHROME_EXE (
    start "" "!CHROME_EXE!" "chrome://extensions"
) else (
    start "" "chrome://extensions" >nul 2>&1
)

REM -----------------------------------------------------------------------------
REM Step 6: Clear, Step-by-Step Instructions
REM -----------------------------------------------------------------------------
echo.
echo ==============================================================================
echo               [*] INSTALLATION READY - FINAL 3 STEPS IN CHROME
echo ==============================================================================
echo.
echo  Step A: In Chrome, look at the top-right corner of the Extensions page:
echo         [ ] Toggle ON "Developer mode"
echo.
echo  Step B: Look at the top-left corner:
echo         Click the "Load unpacked" button.
echo.
echo  Step C: In the folder selection window that opens:
echo         1. Click the address bar at the top of the dialog.
echo         2. Press [Ctrl + V] to paste the path:
echo            "!EXTENSION_DIR!"
echo         3. Press Enter, then click "Select Folder".
echo.
echo ==============================================================================
echo  [OK] That's it! "Amrita Student Companion" is now loaded in your Chrome.
echo  [OK] Pin it to your toolbar by clicking the puzzle piece icon in Chrome.
echo  [OK] To update in the future, simply re-run this script anytime!
echo ==============================================================================
echo.
pause
