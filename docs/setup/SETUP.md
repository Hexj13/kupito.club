---
title: Platform setup
owner: platform
tags:
  - type/guide
  - domain/platform
  - scope/platform
  - status/active
---

# Kupito.club Setup (Initial Installation)

## Prerequisites

1. PPCSL repository must be pushed to `git@github.com:Hexj13/PPCSL.git`
2. SSH keys configured for GitHub access

## Step 1: Add PPCSL as Submodule

After PPCSL is pushed to GitHub, add it as a submodule:

```bash
cd ~/kupito.club
git submodule add git@github.com:Hexj13/PPCSL.git core
```

Or if using HTTPS:

```bash
git submodule add https://github.com/Hexj13/PPCSL.git core
```

## Step 2: Commit and Push

```bash
git add -A
git commit -m "Initial kupito.club repository with PPCSL core submodule"
git remote add origin git@github.com:Hexj13/kupito.club.git
git branch -M main
git push -u origin main --force  # Use --force to overwrite old repository
```

## Step 3: Install Dependencies

```bash
# Root
npm install

# Backend
cd core/backend
npm install
cd ../..

# Frontend
cd core/frontend
npm install
cd ../..
```

## Step 4: Verify

```bash
# Check submodule status
git submodule status

# Test build process (copies frontend locales ro/ru and backend locales to core)
npm run prepare:build

# Optional: check required env vars (script lives in core/scripts/)
npm run check-env

# Run linting
cd core/frontend && npm run lint && cd ../..
cd core/backend && npm run lint:check && cd ../..

# Run tests
cd core/frontend && npm run test && cd ../..
cd core/backend && npm run test && cd ../..

# Build frontend
cd core/frontend
npm run build
```

## Updating Core

When PPCSL core is updated:

```bash
cd core
git pull origin main
cd ..
git add core
git commit -m "chore: update PPCSL core"
git push
```
