@echo off
chcp 65001 >nul
echo ==========================================
echo       一键更新并推送到 GitHub 脚本
echo ==========================================
echo.

:: 检查当前目录是否为 Git 仓库
if not exist ".git" (
    echo [错误] 当前目录不是一个 Git 仓库！请先初始化或检查路径。
    pause
    exit /b 1
)

:: 获取用户输入的提交信息（如果不输入则使用默认时间戳）
set /p commit_msg="请输入本次更新的描述 (直接回车将使用当前时间): "
if "%commit_msg%"=="" (
    set commit_msg="更新于 %date% %time%"
)

echo.
echo [1/3] 正在添加所有更改的文件...
git add .
if %errorlevel% neq 0 (
    echo [错误] git add 失败，请检查！
    pause
    exit /b 1
)

echo.
echo [2/3] 正在提交更改: "%commit_msg%"...
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo [提示] 工作区没有需要提交的更改（可能您还没修改任何文件）。
    pause
    exit /b 0
)

echo.
echo [3/3] 正在推送到 GitHub (主分支通常为 main 或 master)...
:: 尝试推送当前分支
git push
if %errorlevel% neq 0 (
    echo [错误] git push 失败！可能是网络原因，或您的分支尚未关联远程仓库。
    echo 如果是第一次推送，请尝试手动运行: git push -u origin main
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎉 恭喜！推送成功！
echo Vercel/Netlify 将在几秒钟内自动为您更新线上链接！
echo ==========================================
pause
