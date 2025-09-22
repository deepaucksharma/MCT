#!/bin/bash

# MCT Project Cleanup Script
# Removes temporary files, test outputs, and one-time setup files

echo "🧹 MCT Project Cleanup Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for removed files
REMOVED_COUNT=0

# Function to remove files/dirs and count
remove_item() {
    if [ -e "$1" ]; then
        rm -rf "$1"
        ((REMOVED_COUNT++))
        echo -e "${GREEN}✓${NC} Removed: $1"
    fi
}

echo "📋 Starting cleanup..."
echo ""

# 1. Remove log files
echo "🔍 Cleaning log files..."
remove_item "/home/deepak/MCT/mct-app/client/build-errors.log"
remove_item "/home/deepak/MCT/.git/gc.log"
find /home/deepak/MCT -name "*.log" -not -path "*/node_modules/*" -exec rm -f {} \; 2>/dev/null

# 2. Remove temporary and backup files
echo "🔍 Cleaning temporary files..."
find /home/deepak/MCT -type f \( -name "*~" -o -name "*.tmp" -o -name "*.bak" -o -name "*.swp" -o -name "*.swo" \) -not -path "*/node_modules/*" -exec rm -f {} \; 2>/dev/null

# 3. Remove test output files (HTML and JSON reports)
echo "🔍 Cleaning test reports..."
remove_item "/home/deepak/MCT/mct-app/e2e-tests/database-verification-report.html"
remove_item "/home/deepak/MCT/mct-app/e2e-tests/database-verification-report.json"
remove_item "/home/deepak/MCT/mct-app/e2e-tests/metrics-verification-report.html"
remove_item "/home/deepak/MCT/mct-app/e2e-tests/metrics-verification-report.json"
remove_item "/home/deepak/MCT/mct-app/e2e-tests/deep-functional-validation-report.html"
remove_item "/home/deepak/MCT/mct-app/e2e-tests/deep-functional-validation-report.json"
remove_item "/home/deepak/MCT/mct-app/e2e-tests/reports/"

# 4. Remove screenshot directories (test outputs)
echo "🔍 Cleaning test screenshots..."
remove_item "/home/deepak/MCT/mct-app/e2e-tests/screenshots/"

# 5. Remove test-results directory
echo "🔍 Cleaning test results..."
remove_item "/home/deepak/MCT/mct-app/e2e-tests/test-results/"

# 6. Remove one-time setup scripts
echo "🔍 Cleaning one-time setup scripts..."
remove_item "/home/deepak/MCT/mct-app/server/check-columns.js"
remove_item "/home/deepak/MCT/mct-app/server/check-db.js"
remove_item "/home/deepak/MCT/mct-app/server/populate-modules.js"

# 7. Remove temporary shell scripts
echo "🔍 Cleaning temporary scripts..."
remove_item "/home/deepak/MCT/mct-app/fix-errors.sh"
remove_item "/home/deepak/MCT/mct-app/test-app.sh"

# 8. Remove database file (if exists - it's in .gitignore anyway)
echo "🔍 Cleaning database files..."
remove_item "/home/deepak/MCT/mct-app/server/data/mct.db"
remove_item "/home/deepak/MCT/mct-app/server/data/mct.db-journal"
remove_item "/home/deepak/MCT/mct-app/server/data/mct.db-wal"

# 9. Clean up visual-verification directory
echo "🔍 Cleaning visual verification..."
remove_item "/home/deepak/MCT/mct-app/visual-verification/"

# 10. Remove .vite cache directories
echo "🔍 Cleaning build caches..."
find /home/deepak/MCT -type d -name ".vite" -not -path "*/node_modules/*" -exec rm -rf {} \; 2>/dev/null

echo ""
echo "=============================="
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo -e "📊 Removed ${YELLOW}$REMOVED_COUNT${NC} items"
echo ""

# Optional: Show remaining project structure
echo "📁 Clean project structure:"
echo "├── PRODUCT_SPECIFICATION.md"
echo "├── IMPLEMENTATION_PLAN.md"
echo "├── IMPLEMENTATION_SUMMARY.md"
echo "├── mct-app/"
echo "│   ├── client/          (React application)"
echo "│   ├── server/          (Express backend)"
echo "│   ├── e2e-tests/       (Test suites)"
echo "│   └── README.md"
echo "└── product-spec/        (Module specifications)"
echo ""

echo "💡 Tips:"
echo "  - Run 'npm install' in client, server, and e2e-tests to reinstall dependencies"
echo "  - Database will be recreated automatically when server starts"
echo "  - Test reports will be regenerated when tests run"
echo ""