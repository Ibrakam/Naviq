"""
Minimal career guidance ML module.

TODO (Naviq): replace dummy training data with real questionnaire answers stored in the DB
and schedule regular re-training once enough production data is available.
"""

import csv
from pathlib import Path
from typing import List, Sequence, Tuple

import numpy as np

# Better keep the question count in a single place; update when the questionnaire changes.
N_QUESTIONS = 20

# 1. Справочник направлений
TRACKS = ["design", "tech", "business", "data", "social"]
DATASET_PATH = Path("naviq_mock_responses.csv")
MODEL_SOURCE = "mock"  # mock | csv | real


def encode_answers(answers: List[str]) -> np.ndarray:
    """
    answers: список из 20 ответов вида ["A", "C", "B", ...]
    Возвращает вектор чисел, где A=0, B=1, C=2, D=3
    """
    mapping = {"A": 0, "B": 1, "C": 2, "D": 3}
    encoded = [mapping.get(a.upper(), 0) for a in answers]
    return np.array(encoded, dtype=np.float32)


def prepare_data(answers: List[str]) -> np.ndarray:
    """
    Converts сырые ответы в матрицу признаков (1, N_QUESTIONS).
    """
    if len(answers) != N_QUESTIONS:
        raise ValueError(f"Ожидается {N_QUESTIONS} ответов, получено {len(answers)}")
    return encode_answers(answers).reshape(1, -1)


def get_dummy_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    ВРЕМЕННО: создаём фиктивные данные для обучения.
    Потом здесь нужно подставить реальные ответы пользователей из БД.
    X: ответы (n_samples x N_QUESTIONS)
    y: индексы направлений
    """
    np.random.seed(42)
    n_samples = 80
    X = np.random.randint(0, 4, size=(n_samples, N_QUESTIONS))
    y = np.random.randint(0, len(TRACKS), size=(n_samples,))
    return X.astype(np.float32), y


def load_dataset_from_csv(csv_path: Path = DATASET_PATH) -> Tuple[np.ndarray, np.ndarray]:
    """
    Загружает данные из CSV, сгенерированного generate_mock_responses.py.
    Формат: user_id,q1..q20,primary_track
    TODO: заменить источник на выгрузку реальных ответов из БД.
    """
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV файл {csv_path} не найден")

    features = []
    labels = []
    track_to_idx = {track: idx for idx, track in enumerate(TRACKS)}

    with csv_path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        expected_fields = {f"q{i}" for i in range(1, N_QUESTIONS + 1)} | {"primary_track"}
        missing = expected_fields - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"В CSV отсутствуют столбцы: {', '.join(sorted(missing))}")

        for row in reader:
            answers = [row[f"q{i}"] for i in range(1, N_QUESTIONS + 1)]
            features.append(encode_answers(answers))
            track = row["primary_track"]
            labels.append(track_to_idx.get(track, 0))

    if not features:
        raise ValueError(f"CSV {csv_path} не содержит строк с данными")

    return np.vstack(features), np.array(labels, dtype=np.int32)


class PrototypeModel:
    """
    Простейшая модель на случай отсутствия scikit-learn:
    усредняет ответы для каждого трека и выбирает ближайший по евклидовой метрике.
    """

    def __init__(self, prototypes: np.ndarray, priors: np.ndarray):
        self.prototypes = prototypes
        self.priors = priors
        self.classes_ = np.arange(len(TRACKS))

    @classmethod
    def from_data(cls, X: np.ndarray, y: np.ndarray) -> "PrototypeModel":
        prototypes = []
        priors = []
        for track_idx in range(len(TRACKS)):
            mask = y == track_idx
            if np.any(mask):
                prototypes.append(X[mask].mean(axis=0))
                priors.append(mask.mean())
            else:
                prototypes.append(np.zeros(X.shape[1], dtype=np.float32))
                priors.append(1.0 / len(TRACKS))
        return cls(np.vstack(prototypes), np.array(priors, dtype=np.float32))

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        # Чем меньше расстояние до прототипа, тем выше вероятность.
        distances = np.linalg.norm(X[:, None, :] - self.prototypes[None, :, :], axis=2)
        similarities = np.exp(-distances) * self.priors
        similarities_sum = similarities.sum(axis=1, keepdims=True) + 1e-9
        return similarities / similarities_sum


def train_model():
    global MODEL_SOURCE
    # Сначала пытаемся загрузить предобученную модель
    try:
        from pathlib import Path
        import pickle
        model_path = Path(__file__).parent / "app" / "ml" / "career_model.pkl"
        with open(model_path, 'rb') as f:
            MODEL_SOURCE = "pretrained"
            return pickle.load(f)
    except (FileNotFoundError, Exception):
        pass

    # Затем пытаемся загрузить из CSV
    try:
        X, y = load_dataset_from_csv()
        MODEL_SOURCE = "csv"
    except (FileNotFoundError, ValueError):
        # TODO: удалить fallback как только появятся реальные накопленные ответы.
        X, y = get_dummy_dataset()
        MODEL_SOURCE = "mock"
    return _fit_model(X, y)


def _fit_model(X: np.ndarray, y: np.ndarray):
    try:
        from sklearn.linear_model import LogisticRegression
    except ImportError:
        return PrototypeModel.from_data(X, y)

    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)
    return model


def train_with_real_data(answer_rows: Sequence[Sequence[str]], tracks: Sequence[str]):
    """
    Fit модель на реальных ответах пользователей.
    answer_rows: список ответов (каждый список длиной N_QUESTIONS, значения A-D)
    tracks: метки направлений (design/tech/business/data/social)
    """
    global MODEL, MODEL_SOURCE

    encoded_rows = []
    label_indices = []

    for answers, track in zip(answer_rows, tracks):
        if track not in TRACKS:
            continue
        if len(answers) != N_QUESTIONS:
            continue
        encoded_rows.append(encode_answers(list(answers)))
        label_indices.append(TRACKS.index(track))

    if not encoded_rows:
        raise ValueError("Недостаточно валидных ответов для обучения")

    X = np.vstack(encoded_rows)
    y = np.array(label_indices, dtype=np.int32)
    MODEL = _fit_model(X, y)
    MODEL_SOURCE = "real"
    return MODEL


MODEL = train_model()


def predict_track(answers: List[str]):
    """
    Принимает сырые ответы пользователя и возвращает:
    - основной трек
    - 3 лучших по вероятности

    После интеграции с реальными данными храните ответы в БД и периодически перелучайте MODEL.
    """
    x = prepare_data(answers)
    probs = MODEL.predict_proba(x)[0]
    top_idx = np.argsort(probs)[::-1]  # по убыванию
    top_tracks = [(TRACKS[i], float(probs[i])) for i in top_idx]
    return {
        "primary_track": top_tracks[0][0],
        "candidates": top_tracks[:3],
        "probabilities": {TRACKS[i]: float(probs[i]) for i in range(len(TRACKS))},
    }


if __name__ == "__main__":
    sample_answers = ["A"] * N_QUESTIONS
    result = predict_track(sample_answers)
    print(result)
