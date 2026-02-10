#!/bin/bash

echo "📦 Committing feedback changes..."

cd /sessions/clever-gifted-mayer/mnt/pm-simulator

# Remove lock file if it exists
rm -f .git/index.lock

# Add all modified files
git add \
  src/components/Home.tsx \
  src/components/Home.module.css \
  src/components/SprintPlanning.tsx \
  src/components/SprintPlanning.module.css \
  src/components/SprintRetro.tsx

# Create commit
git commit -m "Polish UX based on user feedback

- Add funny loading overlay to New Game and Continue buttons
- Change metrics expand/collapse to use words instead of arrows
- Add change deltas to expanded metrics (shows +/- from previous sprint)
- Remove Sprint Summary section from retro (After-Action Report is sufficient)
- Fix events duplication bug by deduplicating based on title
- Align metric bar styling between Sprint Planning and Quarterly Review

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to origin
git push origin main

echo "✅ Changes committed and pushed!"
