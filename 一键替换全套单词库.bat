@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo Vocabulary Tester - Replace Full Word Set
echo ==========================================
echo.
echo This script will fully replace the current word list.
echo Please make sure your txt file has already been updated.
echo.
set /p confirm=Type Y to continue: 
if /i not "!confirm!"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [1/3] Replacing word list from txt...
node replace_words_helper.js
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

set "commit_msg=replace full word set"
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
