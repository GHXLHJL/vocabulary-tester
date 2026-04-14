@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo    单词测试工具 - 一键添加新单词与自动部署
echo ==========================================
echo.

:INPUT_LOOP
set "new_word="
set /p new_word="[1/4] 请输入要新增的【英文单词】 (不加单词直接回车进入下一步): "
if "!new_word!"=="" goto FINISH_INPUT

set "new_meaning="
set /p new_meaning="      请输入对应的【中文释义】: "

set "group_name="
set /p group_name="      请输入对应的【模组编号或名称】 (直接回车默认放到'最新添加'组): "

:: 调用 node 脚本将单词动态注入到 app.js 的词库里
if "!group_name!"=="" (
    node add_word_helper.js "!new_word!" "!new_meaning!"
) else (
    node add_word_helper.js "!new_word!" "!new_meaning!" "!group_name!"
)
echo.
goto INPUT_LOOP

:FINISH_INPUT
echo.
echo [2/4] 正在自动更新本地存储版本号，确保线上所有用户能立即看到新单词...
node add_word_helper.js --update-version

echo.
echo [3/4] 正在将更改记录到 Git 仓库...
git add .
if %errorlevel% neq 0 (
    echo [错误] git add 失败，请检查！
    pause
    exit /b 1
)

:: 获取用户输入的提交信息（如果不输入则使用默认时间戳）
echo.
set "commit_msg="
set /p commit_msg="请输入本次更新的内容描述 (直接回车将使用默认描述): "
if "!commit_msg!"=="" (
    set commit_msg=更新词库：新增了单词于 !date! !time!
)

echo.
echo 正在打包更改: "!commit_msg!"...
git commit -m "!commit_msg!"
if %errorlevel% neq 0 (
    echo [提示] 代码没有任何变动，无需推送。
    pause
    exit /b 0
)

echo.
echo [4/4] 正在推送到 GitHub (触发 Vercel 自动部署)...
git push
if %errorlevel% neq 0 (
    echo [错误] git push 失败！可能是网络原因，请检查连接。
    pause
    exit /b 1
)

echo.
echo ==========================================
echo 🎉 恭喜！新单词已加入并推送成功！
echo Vercel 将在几秒钟内自动为您更新线上链接！
echo ==========================================
pause
