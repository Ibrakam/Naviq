"""
Mock data generator for Naviq career questionnaire.
TODO: заменить генерацию случайных ответов данными из БД как только появятся реальные пользователи.
"""

import csv
import random
from pathlib import Path


TRACKS = ["design", "tech", "business", "data", "social"]
NUM_USERS = 200
NUM_QUESTIONS = 20
OUTPUT_FILE = Path("naviq_mock_responses.csv")


def generate_answer() -> str:
    return random.choice(["A", "B", "C", "D"])


def generate_user_row(user_idx: int):
    row = {"user_id": f"u{user_idx:03d}"}
    for q in range(1, NUM_QUESTIONS + 1):
        row[f"q{q}"] = generate_answer()

    # TODO: когда появится матрица баллов/логика GPT, подставить вычисленный primary_track вместо случайного.
    row["primary_track"] = random.choice(TRACKS)
    return row


def main():
    fieldnames = ["user_id"] + [f"q{i}" for i in range(1, NUM_QUESTIONS + 1)] + ["primary_track"]
    with OUTPUT_FILE.open(mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(1, NUM_USERS + 1):
            writer.writerow(generate_user_row(i))

    # TODO: передать CSV в career_ml.py, чтобы обучать модель на этих данных до появления реальных.
    print(f"Generated {NUM_USERS} rows in {OUTPUT_FILE}")


if __name__ == "__main__":
    # TODO: при интеграции замените генерацию на выгрузку реальных ответов пользователей в том же формате.
    main()
