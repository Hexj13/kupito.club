'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packageName = process.env.MOBILE_APP_PACKAGE_NAME || 'club.kupito.app';
const fingerprints = (process.env.MOBILE_APP_SHA256_FINGERPRINTS || '')
  .split(',')
  .map((fingerprint) => fingerprint.trim())
  .filter(Boolean);

if (fingerprints.length === 0) {
  console.error(
    'Set MOBILE_APP_SHA256_FINGERPRINTS to one or more comma-separated SHA-256 fingerprints.',
  );
  process.exit(1);
}

const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: fingerprints,
    },
  },
];

const outputPath = path.join(root, 'assets/frontend/public/.well-known/assetlinks.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(assetLinks, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)} for ${packageName}.`);
