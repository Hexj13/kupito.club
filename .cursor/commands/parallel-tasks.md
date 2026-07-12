# Parallel tasks: Planner + Executors

Use this when the user's request can be split into **independent** subtasks that are better done in parallel by separate agents. Main chat = Planner; each subtask = one Executor agent.

## 1. Decide if parallelization is useful

- **Yes:** 2–4 independent subtasks (different modules, areas, or types of work: e.g. backend review + frontend review + docs update; or search in `core/frontend` + search in `core/backend` + check scripts).
- **No:** One narrow task, or steps that depend on each other — do the work in the main chat.

## 2. Planner: split the work

- List concrete subtasks. Each must be **self-contained** (enough context in the prompt so the agent does not need the main chat).
- Assign each subtask to one agent. Typical split:
  - By area: e.g. `core/frontend/`, `core/backend/`, `core/docs/`, root `config/` or `locales/`.
  - By type: e.g. "find all usages of X", "run tests for module Y", "update doc Z".
- Prefer **one agent per subtask**; maximum 3–4 agents in one go.

## 3. Launch executors in parallel

- For each subtask, launch one agent (task/agent tool) with:
  - **description:** Short label (e.g. "Review auth in backend").
  - **prompt:** Full instruction, paths, and what to return (e.g. "In core/backend/src/auth/ list all endpoints and note missing tests. Return a short list.").
  - **subagent_type:** `explore` (search/structure), `generalPurpose` (multi-step, code/docs), or `shell` (commands).
- Launch all agents **in the same turn** (parallel), not one after another.

## 4. Collect results and summarize

- When all agents have finished, read their outputs.
- In the main chat: summarize findings, list what was done, and if something needs to be applied (edits, scripts), do that in the main context or by delegating one follow-up task.

## 5. Project-specific scope

- **Platform (root):** `locales/`, `locales/backend/`, `config/`, `theme/`, `assets/`.
- **Core:** `core/frontend/`, `core/backend/`, `core/docs/`. Scripts: `core/backend/src/scripts/`.
- Always pass the relevant path(s) in the agent prompt so the executor knows where to work.

## Reference

- Detailed policy: `.cursor/skills/parallel-executors/SKILL.md`.
- Diagram: Planner (one) → context fork → several Executors (one per subtask); contexts isolated, execution parallel.
