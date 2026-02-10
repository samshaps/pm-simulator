#!/bin/bash

set -e  # Exit on error

echo "🧹 Cleaning up git lockfiles..."
rm -f .git/index.lock
rm -f .git/objects/*/tmp_obj_*
find .git -name "*.lock" -type f -delete 2>/dev/null || true

echo "📋 Checking git status..."
git status --short

echo ""
echo "➕ Adding modified files to staging..."
git add src/components/SprintPlanning.tsx \
        src/components/SprintPlanning.module.css \
        src/components/SprintRetro.tsx

echo ""
echo "📝 Creating commit..."
git commit -m "Improve metrics visibility and retro insights

- Add expandable metrics panel to Sprint Planning with detailed bars
- Auto-opens for Sprint 2+ (onboarding), closed for Sprint 1
- Remove event popup from Sprint Planning (moved to retro)
- Rename Key Takeaways to After-Action Report in Sprint Retro
- Add CEO sentiment insights to retro
- Add Events This Sprint section to After-Action Report

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "Current branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"

# Optional: Uncomment to push to remote
# echo ""
# echo "🚀 Pushing to remote..."
# git push

echo ""
echo "✨ Done! Changes are committed to $(git branch --show-current)"
