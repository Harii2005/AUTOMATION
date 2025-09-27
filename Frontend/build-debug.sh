#!/bin/bash
echo "=== Node Version ==="
node --version
echo "=== NPM Version ==="
npm --version
echo "=== Installing Dependencies ==="
npm ci
echo "=== Building React App ==="
npm run build
echo "=== Build Complete ==="
ls -la build/