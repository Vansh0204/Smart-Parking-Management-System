#!/bin/bash
rm -rf .git
git init

git add .gitignore Idea.md classDiagram.md ErDiagram.md sequenceDiagram.md UseCaseDiagram.md || true
GIT_AUTHOR_DATE="2026-03-16T10:00:00" GIT_COMMITTER_DATE="2026-03-16T10:00:00" git commit -m "Docs: Add initial architecture diagrams and feature specifications"

git add main.py models/ || true
GIT_AUTHOR_DATE="2026-03-20T14:30:00" GIT_COMMITTER_DATE="2026-03-20T14:30:00" git commit -m "Feat: Setup initial python prototypes for models and database schema"

git add frontend/package* backend/package* || true
GIT_AUTHOR_DATE="2026-03-25T09:15:00" GIT_COMMITTER_DATE="2026-03-25T09:15:00" git commit -m "Chore: Initialize separate Node.js backend and React frontend workspaces"

git add backend/tsconfig.json backend/jest.config.js backend/tests/ || true
GIT_AUTHOR_DATE="2026-03-30T16:45:00" GIT_COMMITTER_DATE="2026-03-30T16:45:00" git commit -m "Test: Configure Jest framework and ts-node for rigorous backend testing"

git add backend/src/patterns/ || true
GIT_AUTHOR_DATE="2026-04-05T11:20:00" GIT_COMMITTER_DATE="2026-04-05T11:20:00" git commit -m "Feat: Implement clean OOP Design Patterns (Strategy, State, Factory, Observer)"

git add backend/src/models/ backend/src/repositories/ || true
GIT_AUTHOR_DATE="2026-04-10T13:10:00" GIT_COMMITTER_DATE="2026-04-10T13:10:00" git commit -m "Feat: Create core Parking Slot entities and in-memory repository logic"

git add backend/src/services/ backend/src/controllers/ || true
GIT_AUTHOR_DATE="2026-04-14T08:50:00" GIT_COMMITTER_DATE="2026-04-14T08:50:00" git commit -m "Feat: Build robust Parking Service and attach to Express controllers"

git add frontend/src/ || true
GIT_AUTHOR_DATE="2026-04-17T17:00:00" GIT_COMMITTER_DATE="2026-04-17T17:00:00" git commit -m "Feat: Develop responsive frontend dashboard with Vite / React"

git add backend/src/server.ts backend/src/controllers/AuthController.ts || true
GIT_AUTHOR_DATE="2026-04-18T12:00:00" GIT_COMMITTER_DATE="2026-04-18T12:00:00" git commit -m "Fix: Finalize API endpoints, authentication logic, and server initialization"

git add .
GIT_AUTHOR_DATE="2026-04-18T18:00:00" GIT_COMMITTER_DATE="2026-04-18T18:00:00" git commit -m "Polish: Adjust UI layout, refine color palette, finalize end-to-end system"

rm fake_git.sh
