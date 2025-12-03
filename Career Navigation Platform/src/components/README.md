# Структура Компонентов Naviq

Организация компонентов по функциональному назначению для упрощения навигации и поддержки.

## 📁 Структура папок

```
components/
├── 🔐 admin/              # Админ-панель
│   ├── AdminPanelNew.tsx      # Главный компонент (роутер)
│   ├── AdminLayout.tsx        # Layout с sidebar
│   ├── AdminDashboard.tsx     # Дашборд с аналитикой
│   ├── AdminUsers.tsx         # Управление пользователями
│   ├── AdminCourses.tsx       # Управление курсами
│   ├── AdminSimulations.tsx   # Управление симуляциями
│   └── index.ts               # Экспорты
│
├── 🔑 auth/               # Авторизация
│   ├── Login.tsx              # Страница входа
│   ├── Signup.tsx             # Страница регистрации
│   └── index.ts
│
├── 📝 assessment/         # Карьерные тесты
│   ├── Assessment.tsx         # Старая версия (deprecated)
│   ├── AssessmentNew.tsx      # Новая версия теста
│   ├── AssessmentResults.tsx  # Результаты теста
│   └── index.ts
│
├── 📊 dashboard/          # Главный дашборд
│   ├── Dashboard.tsx          # Главная страница дашборда
│   ├── CareerResultsModern.tsx # Результаты карьерного теста
│   └── index.ts
│
├── 🏠 landing/            # Landing pages
│   ├── Landing.tsx            # Старый landing
│   ├── NewLanding.tsx         # Новый landing (активный)
│   └── index.ts
│
├── 👤 profile/            # Профиль пользователя
│   ├── Profile.tsx            # Страница профиля
│   ├── CompleteProfile.tsx    # Заполнение профиля
│   └── index.ts
│
├── 🎮 simulation/         # Карьерные симуляции
│   ├── SimulationCatalog.tsx  # Каталог симуляций
│   ├── SimulationPlayer.tsx   # Проигрыватель симуляций
│   └── index.ts
│
├── 🎯 gamification/       # Геймификация
│   └── GamificationSection.tsx
│
├── 🎨 common/             # Общие компоненты
│   ├── animated-background.tsx
│   ├── constellation-icon.tsx
│   └── counter-animation.tsx
│
├── 🧩 ui/                 # UI библиотека (shadcn/ui)
│   └── [UI компоненты...]
│
└── 🎨 figma/              # Figma импорты
    └── [Figma компоненты...]
```

## 📦 Импорты

Все папки имеют `index.ts` для удобного импорта:

```typescript
// Старый способ ❌
import { Login } from './components/Login';
import { Signup } from './components/Signup';

// Новый способ ✅
import { Login, Signup } from './components/auth';
```

## 🔄 Примеры импортов

```typescript
// Админка
import { AdminPanelNew, AdminLayout } from './components/admin';

// Авторизация
import { Login, Signup } from './components/auth';

// Ассессмент
import { AssessmentNew, AssessmentResults } from './components/assessment';

// Дашборд
import { Dashboard, CareerResultsModern } from './components/dashboard';

// Landing
import { NewLanding } from './components/landing';

// Профиль
import { Profile, CompleteProfile } from './components/profile';

// Симуляции
import { SimulationCatalog, SimulationPlayer } from './components/simulation';
```

## 📝 Правила организации

1. **По функциональности** - группируем связанные компоненты
2. **Index файлы** - каждая папка имеет index.ts для экспорта
3. **Понятные названия** - папки названы по их назначению
4. **UI отдельно** - UI компоненты в своей папке
5. **Общие компоненты** - переиспользуемые компоненты в common/

## 🚀 Добавление новых компонентов

При добавлении нового компонента:

1. Определи к какой категории он относится
2. Создай файл в соответствующей папке
3. Добавь экспорт в `index.ts` этой папки
4. Обнови документацию при необходимости

Пример:
```typescript
// Создаём: components/auth/ResetPassword.tsx
// Добавляем в: components/auth/index.ts
export { ResetPassword } from './ResetPassword';
```
