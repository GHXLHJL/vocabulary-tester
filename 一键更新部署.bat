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
echo [1/4] Validating txt word list...
python scripts\python\check_vocabulary_txt.py
if !errorlevel! equ 1 (
    echo [ERROR] Validation found problems in txt structure, duplicates, or spelling.
    pause
    exit /b 1
) else if !errorlevel! equ 4 (
    echo.
    echo [WARN] Structural changes were detected. Please review the summary above carefully.
    set /p structure_confirm=Type Y to continue with these structural changes:
    if /i not "!structure_confirm!"=="Y" (
        echo Cancelled.
        pause
        exit /b 0
    )
) else if !errorlevel! equ 3 (
    echo [WARN] Spell check skipped because online dictionary is unavailable. Continuing with structure and duplicate checks only.
) else if !errorlevel! geq 2 (
    echo [ERROR] Validator failed.
    pause
    exit /b 1
)

echo.
echo [2/4] Replacing word list from txt...
node scripts\node\replace_words_helper.js
if !errorlevel! neq 0 (
    echo [ERROR] Failed while replacing words.
    pause
    exit /b 1
)

echo.
echo [3/4] Saving changes to git...
git add .
if !errorlevel! neq 0 (
    echo [ERROR] git add failed.
    pause
    exit /b 1
)

echo.
git diff --cached --quiet --exit-code
set "staged_status=!errorlevel!"
if "!staged_status!"=="0" (
    echo [INFO] No file changes to commit.
    pause
    exit /b 0
)
if not "!staged_status!"=="1" (
    echo [ERROR] Failed to inspect staged changes.
    pause
    exit /b 1
)

echo.
set "commit_msg="
set /p commit_msg=Enter commit message (press Enter for default): 
if "!commit_msg!"=="" (
    for /f "tokens=2 delims='" %%v in ('findstr /c:"const APP_VERSION = '" app.js') do (
        set "app_version=%%v"
    )
    if defined app_version (
        set "commit_msg=update to !app_version!"
    ) else (
        set "commit_msg=update word set"
    )
)

echo.
echo Creating commit...
git commit -m "!commit_msg!"
if !errorlevel! neq 0 (
    echo [ERROR] git commit failed.
    pause
    exit /b 1
)

echo.
echo [4/4] Pushing to GitHub...
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
