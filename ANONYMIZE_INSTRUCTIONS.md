# Instructions to Remove Sensitive Data from Git History

The mock data files have been updated locally to remove sensitive information (Sena Aydin → Sarah Adams, CAMARNEI → COOPER_B, etc.). However, these files still exist in the git history.

## ⚠️ IMPORTANT WARNING

Rewriting git history is a **destructive operation**. After completing these steps:
- The repository's commit hashes will change
- Anyone who has cloned this repository will need to **re-clone** it
- Any open pull requests will need to be recreated

## Option 1: Using git-filter-repo (Recommended - Fastest)

### Install git-filter-repo

```bash
# On macOS with Homebrew
brew install git-filter-repo

# Or with pip
pip3 install git-filter-repo
```

### Create replacement file

Create a file called `replacements.txt`:

```
Sena Aydin==>Sarah Adams
AYDIN_SE==>ADAMS_S
CAMARNEI==>COOPER_B
compass: ==>
Component RsSnackbar==>Component Snackbar Implementation
Component RsPassword==>Component Password Field
Component RsSkeleton==>Component Skeleton Loader
```

### Run the tool

```bash
# 1. Create a backup
git clone . ../jira-timesheet-report-backup

# 2. Run git-filter-repo
git filter-repo --replace-text replacements.txt --force

# 3. Re-add the remote (git-filter-repo removes it for safety)
git remote add origin https://github.com/bcamarneiro/jira-timesheet-report.git

# 4. Force push to GitHub
git push origin --force --all
git push origin --force --tags
```

## Option 2: Using the provided script

I've created a script that uses `git filter-branch`:

```bash
./anonymize-history.sh
```

This will:
1. Create a backup branch
2. Rewrite all commits to replace sensitive data
3. Show you the next steps to force push

After running the script, you'll need to:

```bash
# Force push to GitHub
git push origin --force --all
git push origin --force --tags
```

## Option 3: Nuclear Option - Fresh Start

If you don't care about preserving git history:

```bash
# 1. Remove git history
rm -rf .git

# 2. Initialize fresh repository
git init
git add .
git commit -m "Initial commit with anonymized data"

# 3. Force push to GitHub
git remote add origin https://github.com/bcamarneiro/jira-timesheet-report.git
git push origin main --force
```

## After Rewriting History

1. **Verify the changes**: Check that sensitive data is gone
   ```bash
   # Search for the sensitive terms
   git log --all --full-history -p | grep -i "Sena Aydin"
   git log --all --full-history -p | grep -i "AYDIN_SE"
   git log --all --full-history -p | grep -i "CAMARNEI"
   ```

2. **Notify collaborators**: Anyone who has cloned this repo needs to re-clone it

3. **GitHub cleanup**: After force pushing, GitHub may still cache the old commits for a while. You can contact GitHub support to run garbage collection if needed.

4. **Delete backup branches** (optional):
   ```bash
   git branch -D backup-before-anonymization
   ```

## What Was Anonymized

- **Sena Aydin** → **Sarah Adams**
- **AYDIN_SE** → **ADAMS_S** (username)
- **CAMARNEI** → **COOPER_B** (your username)
- **compass** references (potential internal project name) → removed
- **RsSnackbar, RsPassword, RsSkeleton** → Generic component names

All emails were already using `@example.com` domain.
All Jira URLs were already using `jira.example.com`.
