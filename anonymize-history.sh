#!/bin/bash

# This script will rewrite git history to remove sensitive data
# WARNING: This will rewrite history - all collaborators will need to re-clone

set -e

echo "=========================================="
echo "Git History Anonymization Script"
echo "=========================================="
echo ""
echo "This will rewrite git history to replace sensitive data."
echo "After running this, you'll need to force push to GitHub."
echo ""
echo "The following replacements will be made:"
echo "  - 'Sena Aydin' → 'Sarah Adams'"
echo "  - 'AYDIN_SE' → 'ADAMS_S'"
echo "  - 'CAMARNEI' → 'COOPER_B'"
echo "  - 'compass:' → '' (removed)"
echo "  - 'RsSnackbar' → 'Snackbar Implementation'"
echo "  - 'RsPassword' → 'Password Field'"
echo "  - 'RsSkeleton' → 'Skeleton Loader'"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Creating backup branch..."
git branch backup-before-anonymization 2>/dev/null || echo "Backup branch already exists"

echo ""
echo "Rewriting history..."

# Use git filter-branch to replace sensitive data in all files
git filter-branch --force --tree-filter '
    # Only process if the files exist
    if [ -f frontend/mocks/MockWorklogs.ts ]; then
        # Replace Sena Aydin with Sarah Adams
        sed -i "" "s/Sena Aydin/Sarah Adams/g" frontend/mocks/MockWorklogs.ts 2>/dev/null || sed -i "s/Sena Aydin/Sarah Adams/g" frontend/mocks/MockWorklogs.ts

        # Replace AYDIN_SE with ADAMS_S
        sed -i "" "s/AYDIN_SE/ADAMS_S/g" frontend/mocks/MockWorklogs.ts 2>/dev/null || sed -i "s/AYDIN_SE/ADAMS_S/g" frontend/mocks/MockWorklogs.ts

        # Replace CAMARNEI with COOPER_B
        sed -i "" "s/CAMARNEI/COOPER_B/g" frontend/mocks/MockWorklogs.ts 2>/dev/null || sed -i "s/CAMARNEI/COOPER_B/g" frontend/mocks/MockWorklogs.ts
    fi

    if [ -f frontend/mocks/MockIssueSummaries.ts ]; then
        # Anonymize issue summaries
        sed -i "" "s/compass: //g" frontend/mocks/MockIssueSummaries.ts 2>/dev/null || sed -i "s/compass: //g" frontend/mocks/MockIssueSummaries.ts
        sed -i "" "s/RsSnackbar/Snackbar Implementation/g" frontend/mocks/MockIssueSummaries.ts 2>/dev/null || sed -i "s/RsSnackbar/Snackbar Implementation/g" frontend/mocks/MockIssueSummaries.ts
        sed -i "" "s/RsPassword/Password Field/g" frontend/mocks/MockIssueSummaries.ts 2>/dev/null || sed -i "s/RsPassword/Password Field/g" frontend/mocks/MockIssueSummaries.ts
        sed -i "" "s/RsSkeleton/Skeleton Loader/g" frontend/mocks/MockIssueSummaries.ts 2>/dev/null || sed -i "s/RsSkeleton/Skeleton Loader/g" frontend/mocks/MockIssueSummaries.ts
    fi
' --tag-name-filter cat -- --all

echo ""
echo "=========================================="
echo "History rewrite complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the changes with: git log --oneline"
echo "2. Force push to GitHub with: git push origin --force --all"
echo "3. Force push tags with: git push origin --force --tags"
echo "4. Notify all collaborators to re-clone the repository"
echo ""
echo "If something went wrong, restore with:"
echo "  git reset --hard backup-before-anonymization"
echo ""
