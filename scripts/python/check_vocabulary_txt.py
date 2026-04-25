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
from pathlib import Path
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


def parse_words(file_path: Path) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []

    with file_path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            stripped = line.strip()
            if not stripped:
                continue

            parts = stripped.split()
            if len(parts) < 2:
                continue

            rows.append({
                "line_no": line_no,
                "word": parts[0],
                "raw": stripped,
            })

    return rows


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

    rows = parse_words(file_path)
    general_words, general_ready = load_wordlist(GENERAL_WORDLIST_CACHE_FILE, GENERAL_WORDLIST_URL)
    kaoyan_words, kaoyan_ready = load_wordlist(KAOYAN_WORDLIST_CACHE_FILE, KAOYAN_WORDLIST_URL)
    dictionary_words = general_words | kaoyan_words
    dictionary_ready = bool(dictionary_words) and (general_ready or kaoyan_ready)

    duplicates = find_duplicates(rows)
    suspicious = find_suspicious_spellings(rows, dictionary_words, kaoyan_words) if dictionary_ready else []

    print(f"检测文件: {file_path}")
    print(f"参与检测的单词数: {len(rows)}")
    print()

    print_duplicates(duplicates)
    print_suspicious(suspicious, dictionary_ready)

    if duplicates or suspicious:
        return 1
    if not dictionary_ready:
        return 3
    return 0


if __name__ == "__main__":
    sys.exit(main())
