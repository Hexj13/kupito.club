---
title: Branch protection for main
owner: platform
tags:
  - type/guide
  - domain/ops
  - scope/platform
  - status/active
---

# Branch Protection for `main` (kupito.club and PPCSL)

Configures `main` so that it can only receive code via pull requests with green CI, preventing the "Render deploys broken main while CI still validates" class of incidents.

## Why

- CI now runs on `pull_request`, and `deploy` job only triggers on `push: main` after `frontend-check` and `backend-check` succeed.
- Without branch protection, anyone can still `git push origin main` directly and bypass CI.
- With protection + required checks, merges to `main` are only possible through a PR with passing checks.

## Required checks to mark as required

After the first CI run on `main` each of these statuses will appear in the branch protection UI. Add them as required:

### `kupito.club`
- `Prepare platform files`
- `Frontend check`
- `Backend check`

### `PPCSL` (core)
- `Backend Tests & Lint`
- `Frontend Tests & Lint`
- `TypeScript Type Check`

Optional CI jobs (enable via repo **Variables**, not required for merge by default): `Frontend Lighthouse` (`LIGHTHOUSE_URL`), `Frontend E2E @p0` (`PLAYWRIGHT_BASE_URL`).

`Dependency audit` is blocking at **critical** severity (`npm audit --audit-level=critical`).

## Apply via GitHub UI

For each repo: `Settings` → `Branches` → `Add rule`:

- Branch name pattern: `main`
- Require a pull request before merging: ON
  - Require approvals: 1 (or 0 if solo)
  - Dismiss stale pull request approvals when new commits are pushed: ON
- Require status checks to pass before merging: ON
  - Require branches to be up to date before merging: ON
  - Select required checks from the list above.
- Require conversation resolution before merging: ON
- Do not allow bypassing the above settings: ON
- Restrict who can push to matching branches: allow only `github-actions[bot]` for automation (optional — needed if auto-merge bot opens submodule PRs).
- Allow force pushes: OFF
- Allow deletions: OFF

## Apply via GitHub CLI (alternative)

Requires `gh auth login` with `admin:repo` scope.

### kupito.club

```bash
gh api --method PUT \
  -H "Accept: application/vnd.github+json" \
  repos/Hexj13/kupito.club/branches/main/protection \
  -f required_status_checks.strict=true \
  -F 'required_status_checks.contexts[]=Prepare platform files' \
  -F 'required_status_checks.contexts[]=Frontend check' \
  -F 'required_status_checks.contexts[]=Backend check' \
  -F enforce_admins=true \
  -F 'required_pull_request_reviews.required_approving_review_count=0' \
  -F required_pull_request_reviews.dismiss_stale_reviews=true \
  -F 'restrictions=null' \
  -F allow_force_pushes=false \
  -F allow_deletions=false \
  -F required_conversation_resolution=true
```

### PPCSL (core)

```bash
gh api --method PUT \
  -H "Accept: application/vnd.github+json" \
  repos/Hexj13/PPCSL/branches/main/protection \
  -f required_status_checks.strict=true \
  -F 'required_status_checks.contexts[]=Backend Tests & Lint' \
  -F 'required_status_checks.contexts[]=Frontend Tests & Lint' \
  -F 'required_status_checks.contexts[]=TypeScript Type Check' \
  -F enforce_admins=true \
  -F 'required_pull_request_reviews.required_approving_review_count=0' \
  -F required_pull_request_reviews.dismiss_stale_reviews=true \
  -F 'restrictions=null' \
  -F allow_force_pushes=false \
  -F allow_deletions=false \
  -F required_conversation_resolution=true
```

## Verification

```bash
gh api repos/Hexj13/kupito.club/branches/main/protection
gh api repos/Hexj13/PPCSL/branches/main/protection
```

Expected response contains `required_status_checks.contexts` matching the list above and `allow_force_pushes.enabled: false`.

## Related

- CI workflows: [.github/workflows/ci.yml](../../.github/workflows/ci.yml), [core/.github/workflows/ci.yml](../../core/.github/workflows/ci.yml)
- Deploy hooks: `RENDER_FRONTEND_DEPLOY_HOOK` and `RENDER_BACKEND_DEPLOY_HOOK` repository secrets; Render auto-deploy on `main` should be disabled once hooks are configured to avoid double deploys.
