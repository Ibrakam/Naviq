# Backend PR Checklist For Frontend Integration

## PR 1: Roadmap Task Status/Result API

### Goal
Allow frontend to poll roadmap generation task and fetch final path result after `POST /api/v1/professions/generate-path`.

### Changes
- Add endpoint: `GET /api/v1/professions/tasks/{task_id}`
- Add endpoint: `GET /api/v1/professions/paths/{path_id}`
- Optionally add endpoint: `GET /api/v1/professions/paths/me?status=active`

### Response contract
- `GET /tasks/{task_id}`:
```json
{
  "task_id": "celery-task-id",
  "status": "processing|ok|failed",
  "path_id": "uuid-or-null",
  "error": "string-or-null"
}
```
- `GET /paths/{path_id}`:
```json
{
  "id": "uuid",
  "target_profession_id": "uuid",
  "status": "active|completed|archived",
  "steps": [
    { "title": "", "description": "", "duration_weeks": 2 }
  ],
  "gap_analysis": { "analytics": 0.4 }
}
```

### Notes
- Use Celery `AsyncResult(task_id)` for status mapping.
- Persist `task_id -> path_id` relation (Redis or DB table).
- Return `404` if task is unknown.
- Return `403` if task/path does not belong to current user.

### Acceptance criteria
- Frontend can poll every 2-3s until status changes from `processing`.
- On `ok`, frontend receives `path_id` and can load full roadmap.
- On `failed`, frontend receives readable error.

## PR 2: Simulation Steps Update API (Admin JSON Builder)

### Goal
Allow admin panel to save full step JSON, not just simulation metadata.

### Changes
- Extend endpoint: `PATCH /api/v1/admin/simulations/{simulation_id}`
- Accept optional `steps` in request payload.

### Request contract
```json
{
  "title": "Simulation title",
  "description": "optional",
  "is_active": true,
  "steps": [
    {
      "order": 1,
      "type": "question|task|dialog",
      "content": {
        "prompt": "...",
        "options": ["..."]
      },
      "next_step_rules": {
        "conditions": [{ "if_answer_contains": "delegate", "goto_step": 2 }],
        "default": 2
      }
    }
  ]
}
```

### Implementation requirements
- Validate unique `order` values.
- Replace existing steps atomically in one transaction.
- Validate `next_step_rules` targets exist in submitted orders.
- Return updated simulation with ordered `steps`.

### Acceptance criteria
- Admin can edit and persist full JSON builder payload.
- Invalid step schema returns `422` with clear path-specific errors.

## PR 3: Admin Real-Time Logs Feed

### Goal
Provide real backend event stream for admin dashboard logs instead of mock polling.

### Changes
- Add endpoint (preferred SSE): `GET /api/v1/admin/logs/stream`
- Alternative fallback: `GET /api/v1/admin/logs?cursor=...&limit=50`

### Event contract
```json
{
  "id": "event-id",
  "timestamp": "2026-02-23T12:00:00Z",
  "level": "info|warning|error",
  "event_type": "skill_analysis|simulation_start|simulation_complete|auth_login|admin_update",
  "user_id": "uuid-or-null",
  "payload": {}
}
```

### Source
- Start from `analytics_events` table.
- Include auth/admin events where possible.

### Acceptance criteria
- Admin dashboard can render terminal-style feed with real records.
- Stream supports reconnect with cursor/last-event-id.
- Access restricted to admin role.

## PR 4: Optional But Recommended

### Simulation step feedback payload
- Populate `SimulationStepResponse.skill_update` in `/api/v1/simulations/{id}/step`.
- Enables precise green/red feedback states and final skill delta summary in frontend.

### Suggested contract
```json
{
  "step": null,
  "session": { "simulation_id": "uuid", "current_step_order": 5, "answers": [], "completed": true },
  "finished": true,
  "skill_update": {
    "analytics": 0.03,
    "communication": 0.01
  }
}
```
