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
    python scripts\python\count_words_in_txt.py
) else (
    python scripts\python\count_words_in_txt.py "%target_file%"
)

if not defined no_pause (
    echo.
    pause
)
