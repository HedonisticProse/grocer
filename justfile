# -----------------------------
# Project: Packy2 (SvelteKit)
# -----------------------------

set shell := ["powershell.exe", "-NoLogo", "-Command"]

# Default recipe
default:
    just --list

# -----------------------------
# DEV
# -----------------------------

dev:
    npm run dev

preview:
    npm run preview

install:
    npm install

clean:
    rm -rf node_modules .svelte-kit build docs

reset:
    just clean
    npm install

# -----------------------------
# BUILD & DEPLOY
# -----------------------------

build:
    npm run build
    echo $null > docs/.nojekyll

# Build and commit docs for GitHub Pages
deploy:
    npm run build
    echo $null > docs/.nojekyll
    git add docs
    git commit -m "Build for deployment"
    git push

# Full deploy (safe)
deploy-full:
    npm run build
    echo $null > docs/.nojekyll
    git add .
    git commit -m "Deploy update"
    git push

# -----------------------------
# GIT SHORTCUTS
# -----------------------------

status:
    git status

add:
    git add .

commit msg:
    git commit -m "{{msg}}"

push:
    git push

pull:
    git pull

# Quick add + commit + push
gac msg:
    git add .
    git commit -m "{{msg}}"
    git push

# -----------------------------
# BRANCHING WORKFLOW
# -----------------------------

# Create and switch to a new branch
branch-new name:
    git checkout -b {{name}}

# Switch to existing branch
branch name:
    git checkout {{name}}

# List branches
branches:
    git branch

# Delete local branch
branch-delete name:
    git branch -d {{name}}

# Force delete local branch
branch-delete-force name:
    git branch -D {{name}}

# -----------------------------
# SYNC WITH MAIN
# -----------------------------

# Pull latest main into current branch
sync-main:
    git fetch origin
    git merge origin/main

# Rebase current branch onto main (cleaner history)
rebase-main:
    git fetch origin
    git rebase origin/main

# -----------------------------
# MERGE WORKFLOW
# -----------------------------

# Merge current branch into main (safe flow)
merge-to-main:
    git checkout main
    git pull origin main
    git merge -
    git push origin main

# Merge specific branch into main
merge-branch name:
    git checkout main
    git pull origin main
    git merge {{name}}
    git push origin main

# -----------------------------
# COMPLETE FEATURE FLOW
# -----------------------------

# Start a feature
feature-start name:
    git checkout main
    git pull origin main
    git checkout -b feature/{{name}}

# Finish current feature (merge + cleanup)
feature-finish feature_name:
    git checkout main
    git pull origin main
    git merge feature/{{feature_name}}
    git push origin main
    git branch -d feature/{{feature_name}}

# -----------------------------
# QUICK SAVE ON BRANCH
# -----------------------------

# Commit + push current branch
branch-save msg:
    git add .
    git commit -m "{{msg}}"
    git push -u origin HEAD

# -----------------------------
# TAGGING
# -----------------------------

tag name:
    git tag {{name}}
    git push origin {{name}}

# -----------------------------
# PROJECT HELPERS
# -----------------------------

# Open project in VS Code
code:
    code .

# Run dev + open browser (Windows)
dev-open:
    start http://localhost:5173
    npm run dev

# -----------------------------
# MIGRATION HELPERS
# -----------------------------

# Reminder of migration plan
plan:
    code .claude/PLAN_01.md

# Quick open original Packy reference
packy:
    code .packy

# -----------------------------
# DEBUG
# -----------------------------

rebuild:
    rm -rf .svelte-kit
    npm run build
    echo $null > docs/.nojekyll

fresh:
    rm -rf node_modules package-lock.json
    npm install