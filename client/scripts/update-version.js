const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../public/version.json');
const version = `1.0.${Date.now()}`;

const versionData = {
  version: version,
  buildTime: new Date().toISOString()
};

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
console.log(`✅ Version updated to ${version}`);
