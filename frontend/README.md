# Naviq Frontend (Next.js 15)

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + custom cyber-bento theme
- Framer Motion
- shadcn/ui-style base components
- Zustand
- Recharts
- Lucide React

## Run
1. Install dependencies:
```bash
npm install
```
2. Create env file:
```bash
cp .env.example .env.local
```
3. Start dev server:
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.
Backend API base URL is configured with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Routes
- Auth: `/login`, `/register`
- User: `/dashboard`, `/simulations`, `/professions`, `/roadmap`, `/profile`
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/simulations`, `/admin/courses`, `/admin/prompts`
