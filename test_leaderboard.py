from playwright.sync_api import sync_playwright
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 监听控制台日志
        logs = []
        page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        
        # 获取当前目录的绝对路径
        current_dir = os.getcwd()
        file_url = f"file:///{current_dir.replace('\\', '/')}/index.html"
        
        print(f"Loading page: {file_url}")
        page.goto(file_url)
        page.wait_for_load_state('networkidle')
        
        # 1. 检查排行榜按钮
        btn = page.locator("#view-leaderboard-btn")
        if btn.is_visible():
            print("SUCCESS: Leaderboard button is visible.")
            # 2. 点击排行榜按钮
            btn.click()
            page.wait_for_timeout(2000) # 等待模态框打开和数据拉取
            
            # 3. 检查模态框
            modal = page.locator("#leaderboard-modal")
            if modal.is_visible():
                print("SUCCESS: Leaderboard modal is visible.")
            else:
                print("FAIL: Leaderboard modal is NOT visible.")
        else:
            print("FAIL: Leaderboard button is NOT visible.")
            
        # 4. 检查是否有 Supabase 相关错误
        print("\n--- Console Logs ---")
        for log in logs:
            print(log)
            
        page.screenshot(path="leaderboard_check.png")
        browser.close()

if __name__ == "__main__":
    run_test()