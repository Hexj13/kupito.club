---
title: Android TWA wrapper
owner: platform
tags:
  - type/runbook
  - domain/mobile
  - scope/platform
  - status/active
---

# Android TWA Wrapper

This directory is reserved for the Bubblewrap-generated Android Trusted Web Activity wrapper for `https://kupito.club`.

## App Identity

- Application name: `Kupito`
- Package name: `club.kupito.app`
- Host: `kupito.club`
- Start URL: `https://kupito.club/`
- Manifest URL: `https://kupito.club/manifest.json`
- Fallback type: `customtabs`
- Orientation: `portrait`

## Generate The Wrapper

Run these commands after `bubblewrap doctor` passes locally:

```bash
npm i -g @bubblewrap/cli
bubblewrap doctor
cd android/twa
bubblewrap init --manifest=https://kupito.club/manifest.json
```

During `init`, keep `packageId` as `club.kupito.app` and keep fallback as `customtabs`.
Use `twa-manifest.template.json` as the expected identity baseline when reviewing the generated `twa-manifest.json`.

## Build Artifacts

```bash
cd android/twa
bubblewrap build
```

Expected local artifacts:

- `app-release-signed.apk` for manual device testing.
- `app-release-bundle.aab` for Google Play.

These artifacts and signing files are ignored by the root `.gitignore`.

## Digital Asset Links

The production App Signing SHA-256 fingerprint from Google Play must be added to:

```text
assets/frontend/public/.well-known/assetlinks.json
```

Generate the file from the platform root (also updates `android/twa/twa-manifest.json` fingerprints):

```bash
MOBILE_APP_SHA256_FINGERPRINTS="<Play App Signing SHA-256>" npm run mobile:assetlinks
npm run prepare:build
```

On Render, set `MOBILE_APP_SHA256_FINGERPRINTS` (comma-separated) and optional `MOBILE_APP_PACKAGE_NAME` (`club.kupito.app`). The Next.js route `/.well-known/assetlinks.json` serves the static file when present, otherwise builds JSON from these environment variables.

Do not commit placeholder fingerprints or signing credentials.
