#!/bin/bash

# ============================================
# Script to remove sensitive files from Git history
# ============================================

echo "🔍 Checking for sensitive files in Git..."

# List of patterns to search for
PATTERNS=(
  "\.env$"
  "\.env\..*"
  "\.pem$"
  "\.key$"
  "\.cert$"
  "credentials\.json"
  "secrets\.json"
  "config\.local\."
  "\.bak$"
)

# Check if any sensitive files are tracked
FOUND_FILES=()
for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r file; do
    if [[ -n "$file" ]]; then
      FOUND_FILES+=("$file")
    fi
  done < <(git ls-files | grep -E "$pattern")
done

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
  echo "✅ No sensitive files found in Git history."
  echo "✅ Your repository is clean!"
  exit 0
fi

echo ""
echo "⚠️  Found ${#FOUND_FILES[@]} sensitive file(s) tracked by Git:"
echo ""
for file in "${FOUND_FILES[@]}"; do
  echo "  - $file"
done
echo ""

# Ask for confirmation
read -p "❓ Do you want to remove these files from Git? (yes/no): " confirm

if [[ "$confirm" != "yes" ]]; then
  echo "❌ Cancelled. No changes made."
  exit 0
fi

echo ""
echo "🔄 Removing sensitive files from Git cache..."

# Remove files from Git cache (keeps local files)
for file in "${FOUND_FILES[@]}"; do
  echo "  Removing: $file"
  git rm --cached "$file" 2>/dev/null || echo "  ⚠️  Could not remove: $file"
done

echo ""
echo "✅ Files removed from Git cache!"
echo ""
echo "📝 Next steps:"
echo "1. Commit the changes:"
echo "   git commit -m 'chore: remove sensitive files from git'"
echo ""
echo "2. Push to remote:"
echo "   git push origin main"
echo ""
echo "3. IMPORTANT: If these files were already pushed to GitHub,"
echo "   you need to remove them from Git history using BFG or git filter-branch."
echo ""
echo "4. Check GitHub to see if sensitive data is still there:"
echo "   https://github.com/your-username/your-repo"
echo ""
echo "⚠️  WARNING: Your local files are safe and not deleted."
echo "   They're just removed from Git tracking."
