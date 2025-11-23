#!/bin/bash

# Vercel Ignored Build Step
# This script determines if Vercel should build/deploy based on the git branch
# Exit code 0 = Build, Exit code 1 = Cancel build

echo "Checking if build should proceed..."
echo "Current branch: $VERCEL_GIT_COMMIT_REF"

# Only build on master or main branches
if [[ "$VERCEL_GIT_COMMIT_REF" == "master" ]] || [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]]; then
  echo "✅ Building on production branch: $VERCEL_GIT_COMMIT_REF"
  exit 0
else
  echo "⏭️  Skipping build on development branch: $VERCEL_GIT_COMMIT_REF"
  exit 1
fi
