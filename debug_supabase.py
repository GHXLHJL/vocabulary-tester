from playwright.sync_api import sync_playwright
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 监听控制台日志
        logs = []
        page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        
        current_dir = os.getcwd()
        file_url = f"file:///{current_dir.replace('\\', '/')}/index.html"
        
        page.goto(file_url)
        page.wait_for_load_state('networkidle')
        
        # 检查 supabase 变量
        is_supabase_defined = page.evaluate("typeof window.supabase !== 'undefined'")
        print(f"Is Supabase SDK loaded: {is_supabase_defined}")
        
        # 检查 app.js 中的 supabase 实例
        # 注意：supabase 是在闭包里的，所以不能直接访问，但我们可以检查它是否有尝试初始化
        
        # 截屏看一眼界面
        page.screenshot(path="debug_view.png")
        
        print("\n--- Console Logs ---")
        for log in logs:
            print(log)
            
        browser.close()

if __name__ == "__main__":
    run_test()