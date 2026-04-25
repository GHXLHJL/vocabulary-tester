@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo ==========================================
echo Vocabulary Tester - Update From TXT
echo ==========================================
echo.
echo This script will read the configured txt word list,
echo replace the website word set, commit, and push to GitHub.
echo.
set /p confirm=Type Y to continue: 
if /i not "!confirm!"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [1/3] Replacing word list from txt...
node scripts\node\replace_words_helper.js
if !errorlevel! neq 0 (
    echo [ERROR] Failed while replacing words.
    pause
    exit /b 1
)

echo.
echo [2/3] Saving changes to git...
git add .
if !errorlevel! neq 0 (
    echo [ERROR] git add failed.
    pause
    exit /b 1
)

echo.
set "commit_msg="
set /p commit_msg=Enter commit message (press Enter for default): 
if "!commit_msg!"=="" (
    for /f "tokens=2 delims='" %%v in ('findstr /c:"const STORAGE_KEY = 'vocabulary_tester_data_" app.js') do (
        set "storage_key=%%v"
    )
    set "version=!storage_key:vocabulary_tester_data_=!"
    if defined version (
        set "commit_msg=update to !version!"
    ) else (
        set "commit_msg=update word set"
    )
)

echo.
echo Creating commit...
git commit -m "!commit_msg!"
if !errorlevel! neq 0 (
    echo [INFO] No file changes to commit.
    pause
    exit /b 0
)

echo.
echo [3/3] Pushing to GitHub...
git push
if !errorlevel! neq 0 (
    echo [ERROR] git push failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Done. New word set has been uploaded.
echo GitHub Pages will update soon.
echo ==========================================
pause
