#!/usr/bin/env bash
# ==============================================================================
# AegisCare - Automated GitHub Repository Initialization & Push (Linux/macOS)
# ==============================================================================

set -e

echo "==> [1/3] Initializing local Git repository..."
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed."
    exit 1
fi

git init
git checkout -b main || git branch -M main
git add .
git commit -m "feat: initial commit of AegisCare elderly care & medication management platform"

echo "==> [2/3] Checking for GitHub CLI (gh)..."
if command -v gh &> /dev/null; then
    echo "Creating public repository on GitHub..."
    gh repo create aegiscare-platform --public --source=. --remote=origin --push
    echo "================================================================="
    echo " 🎉 GitHub Repository created and pushed successfully!"
    echo "================================================================="
    exit 0
fi

echo "==> [3/3] GitHub CLI not found. To link to your GitHub repository manually:"
echo "   1. Create an empty repo on https://github.com/new named 'aegiscare-platform'"
echo "   2. Run:"
echo "      git remote add origin https://github.com/YOUR_USERNAME/aegiscare-platform.git"
echo "      git branch -M main"
echo "      git push -u origin main"
