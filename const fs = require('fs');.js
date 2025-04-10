const fs = require('fs');
const path = require('path');

// Build configuration object using environment variables
const config = {
  // Change process.env.VITE_API_URL via your deployment environment
  VITE_API_URL: process.env.VITE_API_URL || '/api'
};

// Prepare the content of config.js
const configContent = `window.__CONFIG__ = ${JSON.stringify(config, null, 2)};`;

// Determine the output path (adjust if needed)
const outputPath = path.join(__dirname, '..', 'packages', 'auth', 'frontend', 'public', 'config.js');

fs.writeFileSync(outputPath, configContent);
console.log(`✅ Config file written to ${outputPath}`);