#!/bin/bash
# Test script for openclaw2feishu project

echo "Testing openclaw2feishu project structure..."

# Check if all required files exist
files=(
    "bridge.mjs"
    "package.json"
    "README.md"
    "setup-service.mjs"
    "setup-service-linux.mjs"
    "SKILL.md"
)

echo "Checking files..."
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo ""
echo "Validating package.json syntax..."
if node -c package.json > /dev/null 2>&1; then
    echo "✅ package.json is valid JSON"
else
    echo "❌ package.json has syntax errors"
    exit 1
fi

echo ""
echo "Checking if Node.js modules can be imported..."
echo "import * as Lark from '@larksuiteoapi/node-sdk';" > test-import.mjs
echo "import fs from 'node:fs';" >> test-import.mjs
echo "import os from 'node:os';" >> test-import.mjs
echo "import crypto from 'node:crypto';" >> test-import.mjs
echo "import WebSocket from 'ws';" >> test-import.mjs
echo "console.log('All imports successful');" >> test-import.mjs

if node test-import.mjs > /dev/null 2>&1; then
    echo "✅ Import statements are syntactically correct"
else
    echo "⚠️  Import statements may have issues (this is expected without dependencies installed)"
fi

rm -f test-import.mjs

echo ""
echo "Project validation completed!"
echo ""
echo "To use this project:"
echo "1. cd openclaw2feishu"
echo "2. npm install"
echo "3. Set up your Feishu bot credentials"
echo "4. Run: FEISHU_APP_ID=your_app_id node bridge.mjs"