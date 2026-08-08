import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_JS_PATH = PROJECT_ROOT / "app.js"
APP_URL = "http://127.0.0.1:8000/index.html"
STORAGE_KEY = "vocabulary_tester_data_v26.7.9"
PROFILE_STORAGE_KEY = "vocabulary_tester_profile_v1"
DEFAULT_NICKNAME = "考研战士"
EXPECTED_NICKNAME = "昵称保留测试"
EXPECTED_USER_ID = "persist-user-001"


def parse_group_word_order():
    content = APP_JS_PATH.read_text(encoding="utf-8")
    pattern = re.compile(r"group:\s*(\d+),\s*word:\s*'([^']+)'")
    groups = {}
    for match in pattern.finditer(content):
        group_id = int(match.group(1))
        word = match.group(2)
        groups.setdefault(group_id, []).append(word)
    return groups


def build_displayed_groups(page):
    return page.evaluate(
        """
        () => {
            const rows = Array.from(document.querySelectorAll('#word-tbody tr'));
            const groups = [];
            let current = null;

            for (const row of rows) {
                if (row.classList.contains('group-separator')) {
                    const moduleId = row.id || '';
                    const groupId = Number(moduleId.replace('module-', ''));
                    current = { groupId, words: [] };
                    groups.push(current);
                    continue;
                }

                if (!current) continue;
                const wordCell = row.querySelector('.word-cell');
                if (wordCell) {
                    current.words.push(wordCell.innerText.trim());
                }
            }

            return groups;
        }
        """
    )


def run_nickname_persistence_test(page):
    page.goto(APP_URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("#user-nickname", state="attached")

    page.evaluate(
        f"""
        () => {{
            const baseData = JSON.parse(localStorage.getItem('{STORAGE_KEY}'));
            baseData.systemState.userId = '{EXPECTED_USER_ID}';
            baseData.systemState.nickname = '{DEFAULT_NICKNAME}';
            localStorage.setItem('{STORAGE_KEY}', JSON.stringify(baseData));
            localStorage.setItem('{PROFILE_STORAGE_KEY}', JSON.stringify({{
                userId: '{EXPECTED_USER_ID}',
                nickname: '{EXPECTED_NICKNAME}'
            }}));
        }}
        """
    )

    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("#user-nickname", state="attached")

    state = page.evaluate(
        f"""
        () => {{
            const mainData = JSON.parse(localStorage.getItem('{STORAGE_KEY}'));
            const profileData = JSON.parse(localStorage.getItem('{PROFILE_STORAGE_KEY}'));
            return {{
                inputNickname: document.querySelector('#user-nickname').value.trim(),
                mainNickname: mainData?.systemState?.nickname || '',
                mainUserId: mainData?.systemState?.userId || '',
                profileNickname: profileData?.nickname || '',
                profileUserId: profileData?.userId || ''
            }};
        }}
        """
    )

    assert state["inputNickname"] == EXPECTED_NICKNAME, state
    assert state["mainNickname"] == EXPECTED_NICKNAME, state
    assert state["profileNickname"] == EXPECTED_NICKNAME, state
    assert state["mainUserId"] == EXPECTED_USER_ID, state
    assert state["profileUserId"] == EXPECTED_USER_ID, state
    return state


def run_shuffle_test(page, original_groups):
    page.goto(APP_URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("#user-nickname", state="attached")

    page.evaluate("() => localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("#start-daily-btn")

    page.click("#start-daily-btn")
    page.wait_for_selector("#test-action-confirm-modal.open")
    page.click("#test-action-confirm-btn")
    page.wait_for_selector("#word-tbody tr")

    displayed_groups = build_displayed_groups(page)
    assert displayed_groups, "未抽到任何词组"

    checked_groups = []
    unchanged_groups = []

    for group in displayed_groups:
        group_id = group["groupId"]
        displayed_words = group["words"]
        original_words = original_groups.get(group_id, [])

        if len(displayed_words) <= 1 or len(original_words) != len(displayed_words):
            continue

        checked_groups.append({
            "groupId": group_id,
            "original": original_words,
            "displayed": displayed_words
        })

        if displayed_words == original_words:
            unchanged_groups.append(group_id)

    assert checked_groups, "未找到可用于验证乱序的多词词组"
    assert not unchanged_groups, {
        "message": "存在组内顺序仍与原始顺序完全一致的词组",
        "unchanged_groups": unchanged_groups,
        "samples": checked_groups[:5]
    }
    return {
        "checked_group_count": len(checked_groups),
        "sample_groups": checked_groups[:5]
    }


def main():
    original_groups = parse_group_word_order()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        context1 = browser.new_context()
        page1 = context1.new_page()
        nickname_state = run_nickname_persistence_test(page1)
        context1.close()

        context2 = browser.new_context()
        page2 = context2.new_page()
        shuffle_state = run_shuffle_test(page2, original_groups)
        context2.close()

        browser.close()

    print(json.dumps({
        "nickname_test": nickname_state,
        "shuffle_test": shuffle_state
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
