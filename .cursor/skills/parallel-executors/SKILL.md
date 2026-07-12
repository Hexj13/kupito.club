---
name: parallel-executors
description: Splits broad kupito.club/PPCSL tasks into independent subtasks and runs them with parallel agents using a planner plus executors pattern. Use when the user asks to use agents, split work in parallel, review several modules at once, or analyze frontend, backend, and docs simultaneously.
---

# Parallel Executors

## Use this skill when

- The task naturally splits into 2 to 4 independent subtasks.
- Different areas can be explored in parallel, such as `core/frontend/`, `core/backend/`, `core/docs/`, `config/`, or `locales/`.
- The user explicitly asks to use agents or parallelize work.

## Do not use this skill when

- The task is narrow and fits one context.
- Steps depend on each other.
- One direct search or one file read is enough.
- Structural discovery fits codebase-memory-mcp in the main chat (who calls X, call chains, architecture, routes, blast radius). Use `.cursor/skills/codebase-memory-kupito/SKILL.md` instead of spawning multiple `explore` agents for one graph question.

## Planner pattern

1. Define the work split.
- Break the request into independent subtasks.
- Use one agent per subtask.
- Do not duplicate the same work across agents.
- Prefer no more than 3 to 4 agents in one turn.

2. Choose scope per agent.
- Split by area when possible: `core/frontend/`, `core/backend/`, `core/docs/`, root `config/`, `locales/`, or scripts.
- Split by task type only when clearer: search, code review, tests, docs update, shell execution.

3. Write self-contained prompts.
- Each agent prompt must include the goal, exact path or scope, constraints, and expected output.
- Executors do not know the main chat context, so prompts must stand on their own.

4. Choose the right agent type.
- Prefer codebase-memory-mcp in the main chat for call graphs, symbol structure, routes, and architecture before launching explorers.
- `explore` for deep file reading and locating code after the graph narrowed the scope, or for exact-text / non-indexed searches.
- `generalPurpose` for multi-step reasoning, review, or docs work.
- `shell` for git, tests, scripts, or command-heavy tasks.

5. Merge results in the main chat.
- Summarize outputs from all agents.
- Apply edits, follow-up commands, or final synthesis in the main context.

## Project-specific guidance

- This repo is multi-repository: platform root plus `core/` submodule.
- Root contains platform-specific source of truth: `locales/`, `locales/backend/`, `theme/`, `config/`, `assets/`.
- Core contains implementation: `core/frontend/`, `core/backend/`, `core/docs/`.
- Always pass relevant paths to each executor.

## Example splits

- Feature review: one agent for `core/frontend/`, one for `core/backend/`, one for docs/legal impact.
- Search task (exact text / locales / configs): one agent for frontend, one for backend, one for scripts/config. For symbol call graphs, use codebase-memory-mcp in the main chat instead.
- Structural map then deep dive: run CBM (`search_graph` / `trace_path`) first, then parallel agents only for independent file-level follow-up.
- Release investigation: one agent for failing tests, one for lint/build issues, one for documentation impact.

## References

- `.cursor/commands/parallel-tasks.md`
- `.cursor/skills/codebase-memory-kupito/SKILL.md`
- `.cursor/rules/architecture.mdc`
