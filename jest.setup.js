// Loads .env into process.env for tests, mirroring how Expo injects
// EXPO_PUBLIC_* vars at runtime — without this, any test that transitively
// imports src/services/supabase.ts fails before it even runs.
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}
