"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function syncFile(absFrom, absTo, transform) {
  let payload = fs.readFileSync(absFrom);
  if (typeof transform === "function") {
    payload = Buffer.from(transform(payload.toString("utf8")), "utf8");
  }
  let changed = true;
  try {
    const dst = fs.readFileSync(absTo);
    changed = payload.length !== dst.length || !payload.equals(dst);
  } catch {
    changed = true;
  }
  if (changed) {
    fs.mkdirSync(path.dirname(absTo), { recursive: true });
    fs.writeFileSync(absTo, payload);
  }
}

function walkSyncFiles(absFromDir, absToDir) {
  if (!fs.existsSync(absFromDir)) {
    console.error("Missing directory:", absFromDir);
    process.exit(1);
  }
  fs.mkdirSync(absToDir, { recursive: true });
  for (const ent of fs.readdirSync(absFromDir, { withFileTypes: true })) {
    const from = path.join(absFromDir, ent.name);
    const to = path.join(absToDir, ent.name);
    if (ent.isDirectory()) {
      walkSyncFiles(from, to);
    } else {
      syncFile(from, to);
    }
  }
}

function main() {
  const localeFront = [
    ["locales/ro.json", "core/frontend/lib/locales/ro.json"],
    ["locales/ru.json", "core/frontend/lib/locales/ru.json"],
    ["locales/en.json", "core/frontend/lib/locales/en.json"],
  ];
  const localeBack = [
    ["locales/backend/ro.json", "core/backend/src/common/i18n/ro.json"],
    ["locales/backend/ru.json", "core/backend/src/common/i18n/ru.json"],
    ["locales/backend/en.json", "core/backend/src/common/i18n/en.json"],
  ];
  for (const [relFrom, relTo] of [...localeFront, ...localeBack]) {
    syncFile(path.join(root, relFrom), path.join(root, relTo));
  }

  const configDir = path.join(root, "config");
  const configDest = path.join(root, "core/frontend/lib/config");
  fs.mkdirSync(configDest, { recursive: true });
  for (const name of fs.readdirSync(configDir)) {
    if (name.endsWith(".ts") || name.endsWith(".json")) {
      const from = path.join(configDir, name);
      const to = path.join(configDest, name);
      if (name === "legal.ts") {
        syncFile(from, to, (text) =>
          text.replace(
            "from '../core/frontend/lib/content/legal'",
            "from '../content/legal'",
          ),
        );
      } else {
        syncFile(from, to);
      }
    }
  }

  syncFile(
    path.join(root, "config/parsers.ts"),
    path.join(root, "core/backend/src/common/config/parsers.ts"),
  );

  const themeDir = path.join(root, "theme");
  const themeDest = path.join(root, "core/frontend/lib/theme");
  fs.mkdirSync(themeDest, { recursive: true });
  for (const name of fs.readdirSync(themeDir)) {
    if (name.endsWith(".ts")) {
      syncFile(path.join(themeDir, name), path.join(themeDest, name));
    }
  }

  walkSyncFiles(
    path.join(root, "assets/frontend/public"),
    path.join(root, "core/frontend/public"),
  );

  const wmFrom = path.join(root, "assets/backend/watermark");
  const wmTo = path.join(root, "core/backend/assets/watermark");
  fs.mkdirSync(wmTo, { recursive: true });
  if (fs.existsSync(wmFrom)) {
    for (const name of fs.readdirSync(wmFrom)) {
      const fp = path.join(wmFrom, name);
      if (fs.statSync(fp).isFile()) {
        syncFile(fp, path.join(wmTo, name));
      }
    }
  }

  const mobileRoot = path.join(root, "core/mobile");
  if (fs.existsSync(mobileRoot)) {
    const mobileI18n = path.join(mobileRoot, "src/i18n");
    fs.mkdirSync(mobileI18n, { recursive: true });
    for (const loc of ["ro", "ru", "en"]) {
      syncFile(
        path.join(root, `locales/${loc}.json`),
        path.join(mobileI18n, `${loc}.json`),
      );
    }

    const mobileThemeSynced = path.join(mobileRoot, "src/theme/synced");
    fs.mkdirSync(mobileThemeSynced, { recursive: true });
    for (const name of fs.readdirSync(themeDir)) {
      if (name.endsWith(".ts")) {
        syncFile(path.join(themeDir, name), path.join(mobileThemeSynced, name));
        if (name === "colors.ts") {
          const colorsPath = path.join(mobileThemeSynced, "colors.ts");
          let colorsSrc = fs.readFileSync(colorsPath, "utf8");
          colorsSrc = colorsSrc.replace(
            "import type { ThemeColors } from '../theme';",
            "import type { ThemeColors } from './theme-types';",
          );
          fs.writeFileSync(colorsPath, colorsSrc);
        }
      }
    }

    const mobileSynced = path.join(mobileRoot, "src/synced");
    fs.mkdirSync(mobileSynced, { recursive: true });
    fs.writeFileSync(
      path.join(mobileSynced, "i18n-lite.ts"),
      "export type Locale = 'ro' | 'ru';\n",
    );
    syncFile(
      path.join(root, "core/frontend/lib/constants.ts"),
      path.join(mobileSynced, "constants.ts"),
    );
    syncFile(
      path.join(root, "core/frontend/lib/types.ts"),
      path.join(mobileSynced, "types.ts"),
    );
    syncFile(
      path.join(root, "core/frontend/lib/tire-tread.ts"),
      path.join(mobileSynced, "tire-tread.ts"),
    );
    const apiTypesFrom = path.join(root, "core/frontend/lib/api/api-types.ts");
    const apiTypesTo = path.join(mobileSynced, "api-types.ts");
    let apiTypesSrc = fs.readFileSync(apiTypesFrom, "utf8");
    apiTypesSrc = apiTypesSrc.replaceAll("from '../i18n-types'", "from './i18n-lite'");
    apiTypesSrc = apiTypesSrc.replaceAll("from '../tire-tread'", "from './tire-tread'");
    apiTypesSrc = apiTypesSrc.replaceAll("from '../types'", "from './types'");
    fs.writeFileSync(apiTypesTo, apiTypesSrc);

    const mobileAssetsFrom = path.join(root, "assets/mobile/android");
    const mobileAssetsTo = path.join(mobileRoot, "assets/platform/android");
    if (fs.existsSync(mobileAssetsFrom)) {
      walkSyncFiles(mobileAssetsFrom, mobileAssetsTo);
    }
  }
}

main();
