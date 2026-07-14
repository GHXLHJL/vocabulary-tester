from playwright.sync_api import sync_playwright
import time
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Log all console messages
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        
        # Get absolute path to index.html
        file_path = os.path.abspath("index.html")
        url = f"file://{file_path}"
        
        print(f"Navigating to {url}")
        page.goto(url)
        page.wait_for_load_state('networkidle')
        
        # Take initial screenshot
        page.screenshot(path="debug_initial.png")
        
        # Open settings
        print("Opening settings...")
        page.click("#settings-toggle-btn")
        page.wait_for_selector("#settings-modal.open")
        
        # Enter dummy token
        print("Entering dummy token...")
        page.fill("#maimemo-token", "test_token_12345")
        page.click("#save-token-btn")
        
        # Wait for alert and accept it
        page.on("dialog", lambda dialog: dialog.accept())
        
        # Click sync button
        print("Clicking sync button...")
        page.click("#sync-maimemo-btn")
        
        # Wait for some time for proxies to attempt
        print("Waiting for proxy attempts...")
        time.sleep(5)
        
        # Take screenshot of the result (likely an alert)
        page.screenshot(path="debug_sync_result.png")
        
        browser.close()

if __name__ == "__main__":
    run_test()
