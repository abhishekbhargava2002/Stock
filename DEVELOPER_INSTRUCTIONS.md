# Stockora Developer Instructions

## Project Name

**Stockora by Trivoxa**

Stockora is an inventory management SaaS application created, sold, and managed by Trivoxa. The application is built for Indian businesses, distributors, godowns, warehouses, retail operators, and multi-facility organizations.

---

# 1. Repository Rules

## Branches

This repository uses a controlled branch workflow.

### Main branches

| Branch | Purpose |
|---|---|
| `main` | Stable production-ready code only |
| `develop` | Active development and integration branch |
| `feature/*` | New feature development |
| `bugfix/*` | Bug fixes |

## Very Important

Do **not** push directly to `main`.

All development work must be done in a feature branch and merged through a Pull Request.

Correct workflow:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
