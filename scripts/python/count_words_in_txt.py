#!/usr/bin/env python3
"""
统计单词集 txt 中的英文单词数量，不计入中文释义

用法：
python count_words_in_txt.py [file_path]

如果不指定文件，默认统计：
.trae/specs/vocabulary-tester/相似单词集.txt
"""

from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_FILE = PROJECT_ROOT / ".trae" / "specs" / "vocabulary-tester" / "相似单词集.txt"


def count_words(file_path: Path) -> tuple[int, list[str]]:
    """统计 txt 中的英文单词数量，只取每行第一个字段作为单词。"""
    words = []

    with file_path.open("r", encoding="utf-8") as f:
        for line in f:
            stripped = line.strip()

            # 跳过空行
            if not stripped:
                continue

            parts = stripped.split()

            # 跳过标题或无释义的异常行
            if len(parts) < 2:
                continue

            words.append(parts[0])

    return len(words), words


def main():
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1]).expanduser().resolve()
    else:
        file_path = DEFAULT_FILE

    if not file_path.exists():
        print(f"错误: 文件 '{file_path}' 不存在")
        sys.exit(1)

    if not file_path.is_file():
        print(f"错误: '{file_path}' 不是一个文件")
        sys.exit(1)

    total, _ = count_words(file_path)
    print(f"单词总数: {total}")


if __name__ == "__main__":
    main()
