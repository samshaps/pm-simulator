#!/bin/bash

# PM Simulator - Merge to Main Script
# This script commits all changes and merges to main

set -e  # Exit on error

echo "========================================="
echo "PM Simulator - Merge to Main"
echo "========================================="
echo ""

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Show git status
echo "Git status:"
git status
echo ""

# Confirm before proceeding
read -p "Do you want to commit these changes? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Add all changes
echo ""
echo "Adding all changes..."
git add -A

# Commit with descriptive message
echo ""
echo "Creating commit..."
git commit -m "Product feedback fixes

- Randomize starting conditions (\u00b125% variance, balanced totals)
- Remove effort/impact correlation (hidden impact mechanic)
- Add tech debt cap on CTO sentiment (prevents high CTO with high debt)
- Enforce mandatory ticket selection before sprint start
- Align emoji/color thresholds (70/50/30 for all sentiments)
- Fix tech debt color inversion (increase=red, decrease=green)
- Improve ticket size distribution (1-2 small, 2-3 medium, 1-2 large)
- Add 25+ new loading messages (41 total)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo ""
echo "Commit created successfully!"
echo ""

# Push to current branch if not main
if [ "$CURRENT_BRANCH" != "main" ]; then
    read -p "Push to $CURRENT_BRANCH? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing to $CURRENT_BRANCH..."
        git push origin "$CURRENT_BRANCH"
        echo ""
    fi
fi

# Merge to main
read -p "Merge to main? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping merge to main."
    exit 0
fi

echo ""
echo "Switching to main..."
git checkout main

echo "Pulling latest main..."
git pull origin main

echo "Merging $CURRENT_BRANCH into main..."
if [ "$CURRENT_BRANCH" != "main" ]; then
    git merge "$CURRENT_BRANCH" --no-ff -m "Merge $CURRENT_BRANCH: Product feedback fixes"
else
    echo "Already on main, no merge needed."
fi

echo ""
read -p "Push to main? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing to main..."
    git push origin main
    echo ""
    echo "========================================="
    echo "Successfully merged to main!"
    echo "========================================="
else
    echo "Merge complete but not pushed. Run 'git push origin main' when ready."
fi

# Return to original branch if different
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo ""
    read -p "Return to $CURRENT_BRANCH? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout "$CURRENT_BRANCH"
        echo "Returned to $CURRENT_BRANCH"
    fi
fi

echo ""
echo "Done!"
