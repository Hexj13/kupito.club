---
name: codebase-memory-kupito
description: Uses codebase-memory-mcp graph tools for structural code discovery in kupito.club/PPCSL — call chains, architecture, blast radius, routes, and symbol search. Use when finding who calls a function, tracing impact of changes, mapping architecture or Nest/Next routes, detecting dead code, or exploring modules without heavy Grep/Read cycles.
---

# Codebase Memory Kupito

## Use this skill when

- Structural questions: who calls X, what does X call, blast radius, architecture overview, API/routes map, dead code.
- Broad discovery across `core/frontend/`, `core/backend/`, and platform root where file-by-file search would waste tokens.
- Feature review needs impact mapping of the current git diff.

## Do not use this skill when

- Exact text search (translation keys, UI copy, env var names, CSS class strings) — use `Grep`.
- Reading or editing a known file — use `Read` / edit tools.
- MCP server is unavailable — fall back to `Grep` / `Task explore` and say so briefly.

## Project facts

- Indexed project name: `Users-tarantullo-kupito.club`
- Repo root: `/Users/tarantullo/kupito.club` (includes `core/` submodule)
- Graph UI (optional): `http://localhost:9749` — only while MCP process is running
- Do not commit `.codebase-memory/` artifacts unless the user explicitly asks to share the team graph

## Workflow

1. Confirm project.
- First call `list_projects` before any graph query. Do not assume that a server restart preserved the selected project.
- The server requires `project` in every graph-tool request. Pass `project: "Users-tarantullo-kupito.club"` to all subsequent `search_graph`, `search_code`, `trace_path`, `query_graph`, `get_graph_schema`, `get_code_snippet`, and `get_architecture` calls.
- Do not pass the repository path as `project`; use the identifier returned by `list_projects`.
- If the index is missing or stale after large moves, call `index_repository` with `repo_path="/Users/tarantullo/kupito.club"`.

2. Pick the right tool.
- Overview: `get_architecture` (optionally after `get_graph_schema`)
- Find symbol: `search_graph` with `name_pattern` / label (`Function`, `Class`, `Route`, …)
- Call chain: `trace_path` (`direction`: `inbound`, `outbound`, or `both`)
- Diff impact: `detect_changes`
- Text inside indexed files: `search_code`
- Custom graph questions: `query_graph` (read-only openCypher subset)
- Snippet by qualified name: `get_code_snippet` (discover names via `search_graph` first)

3. Then read code.
- Use graph results to open only the relevant files with `Read`.
- Do not replace edits, tests, or domain rules with graph queries.

4. Fallbacks.
- Exact string / locale key / config value → `Grep`
- Multi-area file reading after graph narrowed scope → optional parallel `explore` agents
- Structural “find all usages of symbol X” → CBM in the main chat first; do not spawn three explore agents for one call graph

## Parallel agents

- Prefer one CBM query sequence in the main chat for call graphs and architecture.
- Use parallel executors when work splits by area **and** needs independent file edits or deep reading, not for a single structural lookup.

## References

- `.cursor/skills/feature-review-kupito/SKILL.md` (uses `detect_changes` for blast radius)
- `.cursor/skills/parallel-executors/SKILL.md`
