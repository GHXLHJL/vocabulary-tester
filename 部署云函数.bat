@echo off
echo ==========================================
echo   Supabase Edge Function 部署脚本
echo ==========================================
echo.
echo 正在检查 Supabase CLI...
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Supabase CLI。
    echo 请先运行: npm install -g supabase
    pause
    exit /b
)

echo [1/3] 正在登录 Supabase...
echo 请在弹出的浏览器窗口中完成登录。
call supabase login
if %errorlevel% neq 0 (
    echo [错误] 登录失败。
    pause
    exit /b
)

echo [2/3] 正在初始化 Supabase 项目...
if not exist "supabase\config.toml" (
    call supabase init
)

echo [3/3] 正在部署函数 maimemo-proxy...
call supabase functions deploy maimemo-proxy --project-ref iebdkqswcyuyqsusmocn

echo.
echo ==========================================
echo   部署完成！
echo ==========================================
pause
