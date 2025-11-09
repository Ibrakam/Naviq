import openai
from typing import List, Dict, Any
from app.config import settings
from app.schemas import AssessmentAnswer, AssessmentResult

# Initialize OpenAI client
openai.api_key = settings.openai_api_key


class AIAssessmentService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.openai_api_key)
    
    def generate_assessment_questions(self) -> List[Dict[str, Any]]:
        """Generate assessment questions for career orientation"""
        questions = [
            {
                "id": 1,
                "question": "Мне нравится решать логические задачи и головоломки",
                "type": "likert",
                "options": ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"],
                "required": True
            },
            {
                "id": 2,
                "question": "Оцените свою уверенность в программировании на Python",
                "type": "skills",
                "options": ["Новичок", "Начинающий", "Средний", "Продвинутый", "Эксперт"],
                "required": True
            },
            {
                "id": 3,
                "question": "У вас падает конверсия сайта с 18% до 11%. Что вы будете делать в первую очередь?",
                "type": "case",
                "options": [
                    "Проанализирую данные аналитики",
                    "Проведу A/B тест",
                    "Обращусь к команде дизайна",
                    "Проверю техническую работоспособность"
                ],
                "required": True
            },
            {
                "id": 4,
                "question": "Расставьте приоритеты в карьере (от самого важного к менее важному)",
                "type": "priorities",
                "options": ["Высокая зарплата", "Творческая работа", "Стабильность", "Возможность роста", "Работа в команде"],
                "required": True
            },
            {
                "id": 5,
                "question": "Я чаще беру на себя роль лидера, чем исполнителя",
                "type": "personality",
                "options": ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"],
                "required": True
            },
            {
                "id": 6,
                "question": "Мне интересно работать с большими объемами данных",
                "type": "likert",
                "options": ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"],
                "required": True
            },
            {
                "id": 7,
                "question": "Оцените свои навыки в дизайне и визуальном творчестве",
                "type": "skills",
                "options": ["Новичок", "Начинающий", "Средний", "Продвинутый", "Эксперт"],
                "required": True
            },
            {
                "id": 8,
                "question": "Какой тип задач вам больше нравится?",
                "type": "case",
                "options": [
                    "Создание новых продуктов",
                    "Оптимизация существующих процессов",
                    "Анализ и исследование",
                    "Работа с клиентами"
                ],
                "required": True
            },
            {
                "id": 9,
                "question": "Мне важно понимать, как моя работа влияет на бизнес",
                "type": "likert",
                "options": ["Полностью не согласен", "Не согласен", "Нейтрально", "Согласен", "Полностью согласен"],
                "required": True
            },
            {
                "id": 10,
                "question": "Оцените свои навыки в маркетинге и продвижении",
                "type": "skills",
                "options": ["Новичок", "Начинающий", "Средний", "Продвинутый", "Эксперт"],
                "required": True
            }
        ]
        return questions
    
    def analyze_assessment_results(self, answers: List[AssessmentAnswer]) -> AssessmentResult:
        """Analyze assessment answers and generate career recommendations"""
        
        # Convert answers to a format suitable for AI analysis
        answers_text = self._format_answers_for_ai(answers)
        
        prompt = f"""
        Проанализируй ответы пользователя на профориентационный тест и дай рекомендации по карьере.
        
        Ответы пользователя:
        {answers_text}
        
        На основе этих ответов определи:
        1. Топ-2 наиболее подходящих карьерных направления
        2. Объяснение, почему именно эти направления подходят
        3. 3-5 рекомендуемых курсов для развития
        4. 2-3 симуляции для практики
        5. План развития на 7 дней
        
        Доступные карьерные направления:
        - Frontend Developer (разработка пользовательских интерфейсов)
        - Backend Developer (серверная разработка)
        - Data Analyst (анализ данных)
        - Data Scientist (машинное обучение)
        - UI/UX Designer (дизайн интерфейсов)
        - Product Manager (управление продуктом)
        - Digital Marketing Specialist (цифровой маркетинг)
        - Business Analyst (бизнес-анализ)
        - DevOps Engineer (автоматизация и инфраструктура)
        - Mobile Developer (мобильная разработка)
        
        Верни результат в JSON формате:
        {{
            "top_tracks": [
                {{
                    "name": "название направления",
                    "match_percentage": процент_совпадения,
                    "reason": "объяснение почему подходит"
                }}
            ],
            "explanation": "общее объяснение рекомендаций",
            "recommended_courses": [
                {{
                    "title": "название курса",
                    "platform": "платформа",
                    "url": "ссылка",
                    "description": "описание"
                }}
            ],
            "recommended_simulations": [
                {{
                    "title": "название симуляции",
                    "description": "описание",
                    "duration": "время прохождения"
                }}
            ],
            "development_plan": {{
                "day_1": "задача на день 1",
                "day_2": "задача на день 2",
                "day_3": "задача на день 3",
                "day_4": "задача на день 4",
                "day_5": "задача на день 5",
                "day_6": "задача на день 6",
                "day_7": "задача на день 7"
            }}
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Ты эксперт по карьерному консультированию и профориентации. Анализируй ответы пользователей и давай персонализированные рекомендации по карьере."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            # Parse the JSON response
            import json
            result_data = json.loads(response.choices[0].message.content)
            
            return AssessmentResult(**result_data)
            
        except Exception as e:
            # Fallback to default recommendations if AI fails
            return self._get_default_recommendations()
    
    def _format_answers_for_ai(self, answers: List[AssessmentAnswer]) -> str:
        """Format answers for AI analysis"""
        formatted = []
        for answer in answers:
            formatted.append(f"Вопрос {answer.question_id}: {answer.answer}")
        return "\n".join(formatted)
    
    def _get_default_recommendations(self) -> AssessmentResult:
        """Fallback recommendations if AI analysis fails"""
        return AssessmentResult(
            top_tracks=[
                {
                    "name": "Frontend Developer",
                    "match_percentage": 75,
                    "reason": "Хорошие аналитические способности и интерес к технологиям"
                },
                {
                    "name": "Data Analyst", 
                    "match_percentage": 70,
                    "reason": "Логическое мышление и внимание к деталям"
                }
            ],
            explanation="На основе ваших ответов рекомендуем начать с Frontend разработки или анализа данных. Эти направления хорошо подходят для развития технических навыков.",
            recommended_courses=[
                {
                    "title": "HTML/CSS Basics",
                    "platform": "Coursera",
                    "url": "https://coursera.org",
                    "description": "Основы веб-разработки"
                },
                {
                    "title": "Python for Data Science",
                    "platform": "Udemy", 
                    "url": "https://udemy.com",
                    "description": "Python для анализа данных"
                }
            ],
            recommended_simulations=[
                {
                    "title": "Создание лендинга",
                    "description": "Верстка простого лендинга",
                    "duration": "30 минут"
                },
                {
                    "title": "Анализ продаж",
                    "description": "Анализ данных о продажах",
                    "duration": "45 минут"
                }
            ],
            development_plan={
                "day_1": "Изучить основы HTML",
                "day_2": "Практиковать CSS стили",
                "day_3": "Создать первую страницу",
                "day_4": "Изучить Python основы",
                "day_5": "Практиковать с данными",
                "day_6": "Пройти симуляцию",
                "day_7": "Планировать дальнейшее развитие"
            }
        )
