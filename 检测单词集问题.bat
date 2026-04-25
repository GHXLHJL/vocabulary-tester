@echo off
setlocal
cd /d "%~dp0"

set "target_file=%~1"
set "no_pause="

if /i "%~1"=="--no-pause" (
    set "target_file="
    set "no_pause=1"
) else if /i "%~2"=="--no-pause" (
    set "no_pause=1"
)

if "%target_file%"=="" (
    python scripts\python\check_vocabulary_txt.py
) else (
    python scripts\python\check_vocabulary_txt.py "%target_file%"
)

echo.
if errorlevel 3 (
    echo Spell check skipped because network or online dictionary is unavailable.
) else if errorlevel 2 (
    echo Script failed. Please check the file path.
) else if errorlevel 1 (
    echo Check finished. Problems were found.
) else (
    echo Check finished. No problems found.
)

if not defined no_pause (
    echo.
    pause
)
