#!/bin/bash
# HMNP Site Security and Bloat Cleanup Script
# WARNING: This script will rewrite Git history and force push changes

set -e  # Exit immediately on error

# Configuration
REPO_URL="https://github.com/KennyLightfoot/hmnp-site.git"
WORK_DIR="$HOME/hmnp-cleanup"
REPO_DIR="$WORK_DIR/hmnp-site"
LOG_FILE="$WORK_DIR/cleanup-log.txt"

echo "===== HMNP Site Security and Bloat Cleanup ====="
echo "This script will:"
echo "1. Clone a fresh copy of your repository"
echo "2. Find and remove sensitive files from Git history"
echo "3. Clean up bloat (venvs, backups, etc.)"
echo "4. Reorganize scattered files"
echo "5. Push a cleaned repository"
echo ""
echo "⚠️  WARNING: This will REWRITE GIT HISTORY and FORCE PUSH"
echo "⚠️  All collaborators will need to re-clone the repository"
echo "⚠️  YOU MUST STILL ROTATE ALL EXPOSED CREDENTIALS"
echo ""
read -p "Continue? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
  echo "Operation cancelled"
  exit 1
fi

mkdir -p "$WORK_DIR"
echo "Starting cleanup at $(date)" | tee -a "$LOG_FILE"

# Step 1: Clone fresh copy
if [ -d "$REPO_DIR" ]; then
  echo "Removing existing cleanup directory..."
  rm -rf "$REPO_DIR"
fi

echo "Cloning fresh repository..."
git clone "$REPO_URL" "$REPO_DIR"
cd "$REPO_DIR"
ORIG_SIZE=$(du -sh . | cut -f1)
echo "Original repository size: $ORIG_SIZE" | tee -a "$LOG_FILE"

# Step 2: Find sensitive files
echo "Scanning for sensitive files..."
mkdir -p "$WORK_DIR/evidence"
grep -r "password\|secret\|key\|token\|credential" --include="*.js" --include="*.json" --include="*.env*" --include="*.yaml" --include="*.yml" . > "$WORK_DIR/evidence/sensitive-patterns.txt"
find . -name "*.env*" -o -name "*.key" -o -name "*secret*" -o -name "*password*" > "$WORK_DIR/evidence/sensitive-filenames.txt"
find . -name "*service-account*" -o -name "*serviceaccount*" -o -name "*.json" | grep -i "account\|google\|firebase" > "$WORK_DIR/evidence/service-accounts.txt"

# Step 3: Create list of files to remove from history
cat > "$WORK_DIR/files-to-remove.txt" << EOL
.env
.env.backup
.env.local
.env.production
google-service-account.json
serviceAccountKey.json
credentials.json
client_secret.json
EOL

# Add any other detected secret files
cat "$WORK_DIR/evidence/sensitive-filenames.txt" >> "$WORK_DIR/files-to-remove.txt"

echo "Files to remove from history:" | tee -a "$LOG_FILE"
cat "$WORK_DIR/files-to-remove.txt" | tee -a "$LOG_FILE"

# Step 4: Cleanup bloat before history rewrite
echo "Cleaning up bloat..."
# Move stray files into directories
mkdir -p docs scripts public/assets

# Remove virtual environments, backups, and other large unnecessary files
find . -type d -name "venv" -o -name ".venv" -o -name "env" -o -name "ENV" -o -name "__pycache__" -o -name "*backup*" -o -name "node_modules" -o -name ".next" | xargs rm -rf

# Remove other junk files
find . -name "*.pyc" -o -name "*.pyo" -o -name "*.Zone.Identifier" -o -name ".DS_Store" -o -name "Thumbs.db" -delete

# Organize scattered files
find . -maxdepth 1 -type f -name "*.py" -not -name "setup.py" -exec mv {} scripts/ \;
find . -maxdepth 1 -type f -name "*.md" -not -name "README.md" -not -name "CHANGELOG.md" -exec mv {} docs/ \;
find . -maxdepth 1 -type f -name "*.pdf" -o -name "*.docx" -o -name "*.xlsx" -o -name "*.txt" -not -name "LICENSE.txt" -exec mv {} docs/ \;

# Step 5: Create proper environment templates
cat > .env.example << EOL
# Database Configuration
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=your_password_here
DB_NAME=database_name

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret
EOL

# Step 6: Update .gitignore
cat > .gitignore << EOL
# Environment variables
.env
.env.*
!.env.example

# Credentials and keys
*.pem
*.key
*.p12
*serviceAccount*.json
*service-account*.json
*credential*.json
*secret*.json
*password*.txt

# Python virtual environments
venv/
.venv/
env/
.env/
ENV/
virtualenv/
__pycache__/
*.py[cod]

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Next.js
.next/
out/

# Backups
*backup*/
*.bak
*.backup
*.old

# Build artifacts
dist/
build/

# OS specific
.DS_Store
Thumbs.db
*.Zone.Identifier

# Temporary files
*.tmp
*.temp
*.swp
EOL

# Step 7: Use git-filter-repo to purge sensitive files
echo "Rewriting git history to remove sensitive files..."
git add .gitignore .env.example
git commit -m "Add template .env.example and improve .gitignore for security"

# First take a backup of .git
cp -r .git "$WORK_DIR/git-backup"

# Run filter-repo to remove sensitive files
git filter-repo --force --invert-paths --paths-from-file "$WORK_DIR/files-to-remove.txt"

# Step 8: Analyze and remove large blobs
echo "Analyzing repository size..."
git filter-repo --analyze
cat .git/filter-repo/analysis/path-all-sizes.txt | sort -nr | head -20 > "$WORK_DIR/evidence/largest-files.txt"

# Remove blobs larger than 10MB
echo "Removing files larger than 10MB..."
git filter-repo --force --strip-blobs-bigger-than 10M

# Calculate final size
FINAL_SIZE=$(du -sh . | cut -f1)
echo "Final repository size: $FINAL_SIZE" | tee -a "$LOG_FILE"
echo "Size reduction: $ORIG_SIZE -> $FINAL_SIZE" | tee -a "$LOG_FILE"

# Step 9: Prepare for push
echo ""
echo "===== CLEANUP COMPLETE ====="
echo "Repository has been cleaned and history rewritten."
echo "Size reduced from $ORIG_SIZE to $FINAL_SIZE"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS ⚠️"
echo "1. Review the changes before pushing"
echo "2. Force push to overwrite history: git push origin main --force"
echo "3. ROTATE ALL EXPOSED CREDENTIALS IMMEDIATELY"
echo ""
echo "Evidence and logs saved to $WORK_DIR"

# Optional: Push changes
read -p "Push changes now? This will FORCE PUSH and OVERWRITE repository history (y/n): " push_confirm
if [[ "$push_confirm" == "y" ]]; then
  echo "Force pushing changes..."
  git push origin main --force
  echo "Push complete. Repository history has been rewritten."
  echo "All collaborators will need to re-clone the repository."
else
  echo "Changes not pushed. To push manually:"
  echo "cd $REPO_DIR"
  echo "git push origin main --force"
fi

echo ""
echo "REMINDER: You must rotate all exposed credentials regardless of this cleanup!"