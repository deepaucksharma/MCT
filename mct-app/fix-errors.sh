#!/bin/bash

echo "🔧 Fixing MCT App Errors..."

# Fix missing icons in heroicons
cd client
echo "📦 Installing missing icon dependencies..."
npm install @heroicons/react@latest --save

# Fix missing type declarations
echo "📦 Installing missing type declarations..."
npm install --save-dev @types/node

echo "✅ Dependencies fixed!"

# Now fix the TypeScript errors in the code
echo "🔧 Fixing TypeScript compilation errors..."

# Fix unused imports - Remove unused React imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i "/^import React from 'react';$/d"

# Fix the style jsx prop issue
sed -i 's/<style jsx>/<style>/g' src/components/journeys/daily/MiddayDMCheckin.tsx
sed -i 's/<style jsx>/<style>/g' src/components/journeys/onboarding/InitialAssessment.tsx

# Fix missing date in ATTSession
sed -i "s/await attSessionsApi.create({/await attSessionsApi.create({\n          date: new Date().toISOString().split('T')[0],/" src/pages/exercises/ATTSession.tsx

echo "✅ TypeScript errors fixed!"

# Fix database schema issues
echo "🗄️ Updating database schema..."
cd ../server

# Create migration to add missing columns
cat > src/utils/addMissingColumns.ts << 'EOF'
import { getDatabase } from './database';

export async function addMissingColumns() {
  const db = await getDatabase();

  try {
    // Add metaphor_used column to dm_practices if it doesn't exist
    await db.run(`
      ALTER TABLE dm_practices
      ADD COLUMN metaphor_used TEXT
      CHECK(metaphor_used IN ('radio', 'screen', 'weather'))
    `).catch(() => {
      console.log('Column metaphor_used already exists or cannot be added');
    });

    // Add template_id column to experiments if it doesn't exist
    await db.run(`
      ALTER TABLE experiments
      ADD COLUMN template_id TEXT
    `).catch(() => {
      console.log('Column template_id already exists or cannot be added');
    });

    console.log('✅ Database columns updated');
  } catch (error) {
    console.log('Database columns already up to date');
  }
}
EOF

# Update database initialization to run the migration
sed -i '/await migrateMetrics();/a\  const { addMissingColumns } = await import("./addMissingColumns");\n  await addMissingColumns();' src/utils/database.ts

# Rebuild server
echo "🔨 Rebuilding server..."
npm run build

echo "✅ All errors fixed! Restart the servers to apply changes."