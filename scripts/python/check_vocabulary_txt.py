#!/usr/bin/env python3
"""
检测单词集 txt 中的重复单词和疑似拼写错误。

功能：
1. 检测是否有重复的单词（忽略大小写）
2. 检测单词是否疑似拼写错误

说明：
- 重复单词检测不需要联网
- 拼写检测使用两个公共词库：
  1. 通用英文词库：负责判断单词是否真实存在
  2. 考研词库：负责优先给出更常见、更贴近考试场景的近似推荐
- 若本地还没有词库，会尝试自动下载一次并缓存
- 若下载失败，会跳过拼写检测并给出提示

用法：
python check_vocabulary_txt.py [file_path]
"""

from __future__ import annotations

from collections import defaultdict
import json
from pathlib import Path
import re
from urllib import request
import difflib
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = PROJECT_ROOT / "cache"
DEFAULT_FILE = PROJECT_ROOT / ".trae" / "specs" / "vocabulary-tester" / "相似单词集.txt"
GENERAL_WORDLIST_CACHE_FILE = CACHE_DIR / ".english_words_cache.txt"
GENERAL_WORDLIST_URL = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
KAOYAN_WORDLIST_CACHE_FILE = CACHE_DIR / ".kaoyan_words_cache.txt"
KAOYAN_WORDLIST_URL = "https://raw.githubusercontent.com/busiyiworld/maimemo-export/main/exported/word/%E8%80%83%E7%A0%94%E8%8B%B1%E8%AF%AD%E5%A4%A7%E7%BA%B2%E8%AF%8D%E6%B1%875500.txt"
LOCAL_RAW_DICT_FILE = PROJECT_ROOT / "kaoyan_dict_raw.json"
LOCAL_APP_JS_FILE = PROJECT_ROOT / "app.js"


def load_wordlist(cache_file: Path, source_url: str) -> tuple[set[str], bool]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    if cache_file.exists():
        try:
            words = {
                line.strip().lower()
                for line in cache_file.read_text(encoding="utf-8").splitlines()
                if line.strip()
            }
            if words:
                return words, True
        except OSError:
            pass

    req = request.Request(source_url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with request.urlopen(req, timeout=12) as resp:
            content = resp.read().decode("utf-8")
    except Exception:
        return set(), False

    try:
        cache_file.write_text(content, encoding="utf-8")
    except OSError:
        pass

    words = {line.strip().lower() for line in content.splitlines() if line.strip()}
    return words, bool(words)


def load_local_project_words() -> set[str]:
    words: set[str] = set()

    if LOCAL_RAW_DICT_FILE.exists():
        try:
            raw_dict = json.loads(LOCAL_RAW_DICT_FILE.read_text(encoding="utf-8"))
            if isinstance(raw_dict, dict):
                for key in raw_dict.keys():
                    if isinstance(key, str) and key.strip():
                        words.add(key.strip().lower())
        except (OSError, json.JSONDecodeError):
            pass

    if LOCAL_APP_JS_FILE.exists():
        try:
            app_js = LOCAL_APP_JS_FILE.read_text(encoding="utf-8")
            for match in re.finditer(r"\bword:\s*['\"]([A-Za-z][A-Za-z()'\\-]*)['\"]", app_js):
                words.add(match.group(1).strip().lower())
        except OSError:
            pass

    return words


def normalize_word(word: str) -> str:
    return word.strip().lower()


def normalize_answer(answer: str) -> str:
    return "/".join(
        sorted(
            item.strip()
            for item in str(answer or "").split("/")
            if item.strip()
        )
    )


def get_word_list_signature(words: list[dict[str, object]]) -> str:
    return "||".join(
        sorted(
            normalize_word(str(item["word"]))
            for item in words
            if str(item["word"]).strip()
        )
    )


def get_group_content_signature(words: list[dict[str, object]]) -> str:
    return "||".join(
        sorted(
            f"{normalize_word(str(item['word']))}::{normalize_answer(str(item.get('meaning', '')))}"
            for item in words
            if str(item["word"]).strip()
        )
    )


def is_group_separator_line(line: str) -> bool:
    return bool(re.fullmatch(r"[-—=]{2,}", line.strip()))


def parse_words(file_path: Path) -> tuple[list[dict[str, object]], list[list[dict[str, object]]], list[dict[str, object]]]:
    rows: list[dict[str, object]] = []
    groups: list[list[dict[str, object]]] = []
    current_group: list[dict[str, object]] = []
    structure_issues: list[dict[str, object]] = []

    with file_path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            stripped = line.strip().lstrip("\ufeff")
            if not stripped:
                if current_group:
                    groups.append(current_group)
                    current_group = []
                continue

            if stripped == "相似单词集":
                continue

            if is_group_separator_line(stripped):
                if not current_group:
                    structure_issues.append({
                        "line_no": line_no,
                        "message": "存在多余或连续的分组分隔符"
                    })
                else:
                    groups.append(current_group)
                    current_group = []
                continue

            parts = stripped.split()
            if len(parts) < 2:
                structure_issues.append({
                    "line_no": line_no,
                    "message": "该行无法解析为“单词 释义”格式"
                })
                continue

            entry = {
                "line_no": line_no,
                "word": parts[0],
                "meaning": " ".join(parts[1:]),
                "raw": stripped,
            }
            rows.append(entry)
            current_group.append(entry)

    if current_group:
        groups.append(current_group)

    if not groups:
        structure_issues.append({
            "line_no": 0,
            "message": "未解析出任何有效词组"
        })

    return rows, groups, structure_issues


def load_current_app_groups() -> list[dict[str, object]]:
    if not LOCAL_APP_JS_FILE.exists():
        return []

    try:
        app_js = LOCAL_APP_JS_FILE.read_text(encoding="utf-8")
    except OSError:
        return []

    block_match = re.search(r"const\s+defaultWords\s*=\s*\[\s*\n([\s\S]*?)\s*\];", app_js)
    if not block_match:
        return []

    groups: dict[int, dict[str, object]] = {}
    entry_pattern = re.compile(
        r"group:\s*(\d+),\s*word:\s*['\"]((?:\\['\"]|[^'\"])*)['\"],\s*expectedAnswer:\s*['\"]((?:\\['\"]|[^'\"])*)['\"]"
    )
    for match in entry_pattern.finditer(block_match.group(1)):
        group_id = int(match.group(1))
        word = match.group(2).replace("\\'", "'").replace('\\"', '"')
        meaning = match.group(3).replace("\\'", "'").replace('\\"', '"')
        groups.setdefault(group_id, {"group_id": group_id, "words": []})
        groups[group_id]["words"].append({
            "word": word,
            "meaning": meaning,
        })

    return [groups[key] for key in sorted(groups.keys())]


def score_group_overlap(new_group_words: list[dict[str, object]], existing_group_words: list[dict[str, object]]) -> int:
    new_set = {normalize_word(str(item["word"])) for item in new_group_words}
    existing_set = {normalize_word(str(item["word"])) for item in existing_group_words}
    return sum(1 for word in existing_set if word in new_set)


def assign_stable_group_ids(
    new_groups: list[list[dict[str, object]]],
    existing_groups: list[dict[str, object]],
) -> list[dict[str, object]]:
    remaining_existing_groups = list(existing_groups)
    assigned_ids = {int(group["group_id"]) for group in existing_groups}
    next_group_id = (max(assigned_ids) + 1) if assigned_ids else 1

    def take_existing_group(predicate) -> dict[str, object] | None:
        for index, group in enumerate(remaining_existing_groups):
            if predicate(group):
                return remaining_existing_groups.pop(index)
        return None

    resolved: list[dict[str, object]] = []
    for words in new_groups:
        word_signature = get_word_list_signature(words)
        exact_group = take_existing_group(
            lambda group: get_word_list_signature(group["words"]) == word_signature
        )
        if exact_group:
            resolved.append({"group_id": int(exact_group["group_id"]), "words": words})
            continue

        best_index = -1
        best_overlap = 0
        for index, group in enumerate(remaining_existing_groups):
            overlap = score_group_overlap(words, group["words"])
            if overlap > best_overlap:
                best_overlap = overlap
                best_index = index
                continue

            if overlap == best_overlap and overlap > 0 and best_index != -1:
                best_group = remaining_existing_groups[best_index]
                if int(group["group_id"]) < int(best_group["group_id"]):
                    best_index = index

        if best_index != -1 and best_overlap > 0:
            matched_group = remaining_existing_groups.pop(best_index)
            resolved.append({"group_id": int(matched_group["group_id"]), "words": words})
            continue

        while next_group_id in assigned_ids:
            next_group_id += 1
        assigned_ids.add(next_group_id)
        resolved.append({"group_id": next_group_id, "words": words})
        next_group_id += 1

    return resolved


def summarize_structure_changes(parsed_groups: list[list[dict[str, object]]]) -> dict[str, object]:
    current_app_groups = load_current_app_groups()
    if not current_app_groups:
        return {
            "current_group_count": 0,
            "parsed_group_count": len(parsed_groups),
            "changed_group_ids": [],
            "added_group_ids": [],
            "removed_group_ids": [],
        }

    resolved_groups = assign_stable_group_ids(parsed_groups, current_app_groups)
    current_by_id = {int(group["group_id"]): group for group in current_app_groups}
    resolved_by_id = {int(group["group_id"]): group for group in resolved_groups}

    changed_group_ids = sorted(
        group_id
        for group_id, group in resolved_by_id.items()
        if group_id in current_by_id
        and get_group_content_signature(group["words"]) != get_group_content_signature(current_by_id[group_id]["words"])
    )
    added_group_ids = sorted(group_id for group_id in resolved_by_id if group_id not in current_by_id)
    removed_group_ids = sorted(group_id for group_id in current_by_id if group_id not in resolved_by_id)

    return {
        "current_group_count": len(current_app_groups),
        "parsed_group_count": len(parsed_groups),
        "changed_group_ids": changed_group_ids,
        "added_group_ids": added_group_ids,
        "removed_group_ids": removed_group_ids,
    }


def find_duplicates(rows: list[dict[str, object]]) -> dict[str, list[dict[str, object]]]:
    grouped: dict[str, list[dict[str, object]]] = defaultdict(list)

    for row in rows:
        grouped[str(row["word"]).lower()].append(row)

    return {
        key: items
        for key, items in grouped.items()
        if len(items) > 1
    }


def split_word_variants(word: str) -> list[str]:
    word = word.strip()
    if not word:
        return []

    variants = [word]
    if "(" in word and ")" in word:
        prefix = word.split("(", 1)[0].strip()
        inner = word.split("(", 1)[1].split(")", 1)[0].strip()
        variants = [part for part in (prefix, inner) if part]

    cleaned: list[str] = []
    for variant in variants:
        alpha_only = "".join(ch for ch in variant if ch.isalpha())
        if alpha_only:
            cleaned.append(alpha_only.lower())

    return cleaned


def is_valid_word_form(word: str, dictionary_words: set[str]) -> bool:
    variants = split_word_variants(word)
    if not variants:
        return False

    return any(variant in dictionary_words for variant in variants)


def build_near_matches(preferred_words: set[str], fallback_words: set[str], target: str) -> list[str]:
    normalized_target = split_word_variants(target)
    if not normalized_target:
        return []

    base = normalized_target[0]
    def collect_candidates(word_pool: set[str]) -> list[str]:
        return [
            word for word in word_pool
            if word != base
            and abs(len(word) - len(base)) <= 2
            and word[:1] == base[:1]
        ]

    candidates = collect_candidates(preferred_words)
    if not candidates:
        candidates = collect_candidates(fallback_words)

    exact_family_matches = [
        word for word in candidates
        if len(word) == len(base)
        and word[:2] == base[:2]
        and word[-2:] == base[-2:]
    ]

    if exact_family_matches:
        matches = difflib.get_close_matches(base, exact_family_matches, n=5, cutoff=0.7)
    else:
        matches = difflib.get_close_matches(base, candidates, n=5, cutoff=0.72)

    return matches[:3]


def find_suspicious_spellings(
    rows: list[dict[str, object]],
    dictionary_words: set[str],
    preferred_words: set[str],
) -> list[dict[str, object]]:
    unique_words: list[str] = []
    seen: set[str] = set()

    for row in rows:
        word = str(row["word"])
        lowered = word.lower()
        if lowered not in seen:
            unique_words.append(word)
            seen.add(lowered)

    suspicious: list[dict[str, object]] = []

    for word in unique_words:
        if is_valid_word_form(word, dictionary_words):
            continue

        first_row = next(row for row in rows if str(row["word"]).lower() == word.lower())
        suspicious.append({
            "line_no": first_row["line_no"],
            "word": word,
            "suggestions": build_near_matches(preferred_words, dictionary_words, word),
        })

    return suspicious


def print_duplicates(duplicates: dict[str, list[dict[str, object]]]) -> None:
    print("=== 重复单词检测 ===")
    if not duplicates:
        print("未发现重复单词。")
        print()
        return

    print(f"发现 {len(duplicates)} 组重复单词：")
    for key, items in sorted(duplicates.items()):
        locations = ", ".join(f"第 {item['line_no']} 行: {item['word']}" for item in items)
        print(f"- {key}: {locations}")
    print()


def print_suspicious(suspicious: list[dict[str, object]], dictionary_ready: bool) -> None:
    print("=== 拼写检测 ===")

    if not dictionary_ready:
        print("未能完成拼写检测：公共词库不存在，且自动下载失败。")
        print()
        return

    if not suspicious:
        print("未发现明显的疑似拼写错误。")
        print()
        return

    print(f"发现 {len(suspicious)} 个疑似拼写问题：")
    for item in suspicious:
        suggestions = item["suggestions"]
        if suggestions:
            print(f"- 第 {item['line_no']} 行: {item['word']}    近似词: {', '.join(suggestions)}")
        else:
            print(f"- 第 {item['line_no']} 行: {item['word']}")
    print()


def print_structure_report(
    groups: list[list[dict[str, object]]],
    structure_issues: list[dict[str, object]],
    structure_summary: dict[str, object],
) -> None:
    print("=== 分组结构检测 ===")
    print(f"解析出的词组数: {len(groups)}")

    if structure_issues:
        print(f"发现 {len(structure_issues)} 个格式问题：")
        for item in structure_issues:
            line_text = f"第 {item['line_no']} 行" if item["line_no"] else "文件级"
            print(f"- {line_text}: {item['message']}")
    else:
        print("未发现明显的分组格式错误。")

    if structure_summary["current_group_count"] > 0:
        print(
            "与当前工具词组对比: "
            f"当前 {structure_summary['current_group_count']} 组 -> "
            f"解析后 {structure_summary['parsed_group_count']} 组"
        )
        print(
            f"将受影响的旧词组数: {len(structure_summary['changed_group_ids'])}，"
            f"新增词组数: {len(structure_summary['added_group_ids'])}，"
            f"移除词组数: {len(structure_summary['removed_group_ids'])}"
        )
        if structure_summary["changed_group_ids"]:
            preview = ", ".join(str(item) for item in structure_summary["changed_group_ids"][:20])
            print(f"- 受影响旧词组示例: {preview}")
        if structure_summary["added_group_ids"]:
            preview = ", ".join(str(item) for item in structure_summary["added_group_ids"][:10])
            print(f"- 新增词组示例: {preview}")
        if structure_summary["removed_group_ids"]:
            preview = ", ".join(str(item) for item in structure_summary["removed_group_ids"][:10])
            print(f"- 移除词组示例: {preview}")
    print()


def has_structural_impact(structure_summary: dict[str, object]) -> bool:
    return bool(
        structure_summary["changed_group_ids"]
        or structure_summary["added_group_ids"]
        or structure_summary["removed_group_ids"]
    )


def main() -> int:
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1]).expanduser().resolve()
    else:
        file_path = DEFAULT_FILE

    if not file_path.exists():
        print(f"错误: 文件 '{file_path}' 不存在")
        return 2

    if not file_path.is_file():
        print(f"错误: '{file_path}' 不是一个文件")
        return 2

    rows, groups, structure_issues = parse_words(file_path)
    general_words, general_ready = load_wordlist(GENERAL_WORDLIST_CACHE_FILE, GENERAL_WORDLIST_URL)
    kaoyan_words, kaoyan_ready = load_wordlist(KAOYAN_WORDLIST_CACHE_FILE, KAOYAN_WORDLIST_URL)
    local_project_words = load_local_project_words()
    dictionary_words = general_words | kaoyan_words | local_project_words
    dictionary_ready = bool(dictionary_words) and (general_ready or kaoyan_ready)
    structure_summary = summarize_structure_changes(groups)

    duplicates = find_duplicates(rows)
    suspicious = find_suspicious_spellings(rows, dictionary_words, kaoyan_words) if dictionary_ready else []

    print(f"检测文件: {file_path}")
    print(f"参与检测的单词数: {len(rows)}")
    print()

    print_structure_report(groups, structure_issues, structure_summary)
    print_duplicates(duplicates)
    print_suspicious(suspicious, dictionary_ready)

    if structure_issues or duplicates or suspicious:
        return 1
    if has_structural_impact(structure_summary):
        return 4
    if not dictionary_ready:
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
