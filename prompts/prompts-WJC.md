# Prompts Used (WJC)

This document records the key prompts used during this project, in chronological order:

1. **Initial specification created in v0**
2. **Adoption of `ai-specs` as the primary source of truth**
3. **Activity plan + frontend implementation**
4. **Debugging and operational prompts**

> Note: Some prompts were originally written in Portuguese. For project consistency, this log is written in English and includes an English paraphrase for each prompt.

---

## 1) v0 — Initial spec drafting

### 1.1 Prompt: Draft the first version of the Kanban feature spec (v0)
- **Intent**: Create an initial functional specification for a Position Detail page with a Kanban board.
- **Original prompt (PT-BR)**: (not captured verbatim in this repo)
- **English paraphrase**:
  - "Write a functional spec for a Position Detail page that shows a Kanban board of candidates by interview stage, including drag-and-drop to move candidates between stages and saving via API."
- **Outcome**:
  - A first-pass spec that was later refined and formalized using `ai-specs`.

---

## 2) `ai-specs` — Main spec + plan as the source of truth

### 2.1 Prompt: Use `ai-specs` docs to guide implementation (spec + plan)
- **Intent**: Drive implementation directly from the project’s official spec and implementation plan.
- **Prompt used (as invoked in chat)**:
  - `@ai-specs/.claude/commands/develop-frontend.md @ai-specs/ai-specs/changes/KANBAN-001_frontend.md`
- **English paraphrase**:
  - "Implement the frontend UI/feature following the project rules and the KANBAN-001 frontend implementation plan."
- **Outcome**:
  - Implemented services, types, pages, components, and routing for the Kanban feature according to KANBAN-001.

### 2.2 Prompt: Confirm API contract from the repository spec
- **Intent**: Validate endpoint paths and response shapes against the canonical API specification.
- **English paraphrase**:
  - "Check `ai-specs/ai-specs/specs/api-spec.yml` for the endpoints and response payloads for positions, interview flow, and candidates by position."
- **Outcome**:
  - Confirmed OpenAPI-defined endpoints like `GET /positions/{id}/interviewflow` and `GET /positions`.
  - Identified that the running backend routes in this repo currently expose `/position/:id/...` (singular) which can diverge from the OpenAPI spec.

---

## 3) Activity plan + development prompts (KANBAN-001)

### 3.1 Prompt: Implement Position Detail page + Kanban board
- **Intent**: Build `/positions/:id` page that loads interview flow + candidates and renders a drag-and-drop Kanban board.
- **English paraphrase**:
  - "Create `PositionDetail` page, `KanbanBoard`, `KanbanColumn`, and `CandidateCard` components using React + TypeScript; implement optimistic drag-and-drop stage updates; show feedback messages."
- **Outcome (delivered artifacts)**:
  - Services:
    - `frontend/src/services/positionService.js`
    - `frontend/src/services/candidateService.js` (added `updateCandidateStage`)
  - Types:
    - `frontend/src/types/kanban.types.ts`
  - UI:
    - `frontend/src/pages/PositionDetail.tsx`
    - `frontend/src/components/KanbanBoard.tsx`
    - `frontend/src/components/KanbanColumn.tsx`
    - `frontend/src/components/CandidateCard.tsx`
  - Routing:
    - `frontend/src/App.js` updated to include `/positions/:id`
  - Navigation:
    - `frontend/src/components/Positions.tsx` updated to navigate to `/positions/:id`

### 3.2 Prompt: Add responsive behavior
- **Intent**: Ensure the board layout works on mobile and desktop.
- **English paraphrase**:
  - "Make columns stack vertically on mobile and render horizontally on desktop, keeping the board scrollable when needed."
- **Outcome**:
  - Responsive flex behavior added in `KanbanBoard` and basic layout adjustments in `PositionDetail`.

---

## 4) Debugging + operational prompts

### 4.1 Prompt: Fix build error — axios module not found
- **Intent**: Resolve `Module not found: Can't resolve 'axios'`.
- **Prompt used (as reported by terminal output)**:
  - "Module not found: Error: Can't resolve 'axios' in `frontend/src/services`"
- **English paraphrase**:
  - "Install axios and ensure it is present in `frontend/package.json` dependencies so the frontend compiles."
- **Outcome**:
  - Added `axios` to `frontend/package.json` dependencies and installed it.

### 4.2 Prompt: Provide a curl command to fetch a position’s interview flow
- **Intent**: Quickly test the interview flow endpoint outside the UI.
- **Original prompt (PT-BR)**:
  - "forneça um curl para buscar o flow da position"
- **English paraphrase**:
  - "Provide a curl command to fetch the interview flow for a position."
- **Outcome**:
  - Provided a curl example for `GET http://localhost:3010/position/{id}/interviewflow` (matching the current backend routing in this repo).

### 4.3 Prompt: Functional analysis — Positions page is using fake data
- **Intent**: Identify gaps and required use-cases to replace mock data with real backend data.
- **Original prompt (PT-BR)**:
  - "olhando o projeto e codigo, me parece que a tela de Positions.tsx esta carregando positions fakes, analise isso e o que precisaria ser feito a nivel funcionalidade, casos de uso, sem implementação ainda, para corrigir isso."
- **English paraphrase**:
  - "Analyze why `Positions.tsx` uses fake positions and describe what should be built (functionality and use cases) to correct it, without implementing yet."
- **Outcome (high-level requirements identified)**:
  - Fetch real positions from API (`GET /positions` per OpenAPI), show loading/error/empty states.
  - Ensure navigation uses real `position.id`.
  - Decide and align API path conventions between OpenAPI (`/positions/...`) and current backend (`/position/...`).
  - Define filtering behavior (client-side vs server-side) and query contract if needed.

---

## 5) Notes / TODO (to improve this log)

- **Missing exact v0 prompt text**: If you paste the original v0 prompt(s) you used, we can add them verbatim.
- **API path alignment decision**: The repo currently mixes:
  - **OpenAPI**: `/positions/...`
  - **Backend implementation**: `/position/...`
  - **Frontend implementation** (Kanban services): `/position/...`
  
  Decide which is canonical and align all layers accordingly.


