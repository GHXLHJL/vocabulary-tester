@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo Vocabulary Tester - Add Words and Deploy
echo ==========================================
echo.

:INPUT_LOOP
set "new_word="
set /p new_word=[1/4] Enter English word (press Enter to finish): 
if "!new_word!"=="" goto FINISH_INPUT

set "new_meaning="
set /p new_meaning=      Enter meaning: 

set "group_name="
set /p group_name=      Enter group id or name (press Enter for latest): 

if "!group_name!"=="" (
    node add_word_helper.js "!new_word!" "!new_meaning!"
) else (
    node add_word_helper.js "!new_word!" "!new_meaning!" "!group_name!"
)
echo.
goto INPUT_LOOP

:FINISH_INPUT
echo.
echo [2/4] Updating storage version...
node add_word_helper.js --update-version

echo.
echo [3/4] Saving changes to git...
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
    set "commit_msg=update word list"
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
echo [4/4] Pushing to GitHub...
git push
if !errorlevel! neq 0 (
    echo [ERROR] git push failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Done. New words have been uploaded.
echo GitHub Pages will update soon.
echo ==========================================
pause
