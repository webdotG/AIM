# Development Guide

## Git workflow

```bash
# Fork + clone
git clone <your-fork>
cd AIM
git remote add upstream <original-repo>

# Create feature branch
git checkout -b feature/your-feature

# Commit + push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

# Create PR
gh pr create --title "feat: your feature" --body "Description"
```

## Conventional commits

```
feat:     New, Improvement
fix:      Bug fix
docs:     Documentation only
style:    Formatting, missing semicolons, etc
refactor: Code change that neither fixes a bug nor adds a feature
test:     Adding missing tests or correcting existing tests
chore:    CI, build tools, dependencies
```

## Backend development

### Dev server

```bash
cd backend
npm run dev          # nodemon + TypeScript, port 3003
```

### Testing

```bash
npm run test                # unit + integration
npm run test:unit           # unit only
npm run test:integration    # integration only
npm run test:watch          # watch mode
npm run test:coverage       # coverage report
npm run db:test:up          # Start test DB (Docker)
npm run db:test:reset        # Reset test DB
```

### Linting & type checking

```bash
npm run lint          # ESLint
npm run lint:fix        # Fix lint issues
npm run typecheck       # tsc --noEmit
npm run swagger-serve   # Validate OpenAPI spec
```

## Frontend development

### Dev server

```bash
cd frontend
npm run dev           # Vite dev server, port 5173
```

### Testing

```bash
npm run test          # Jest
npm run test:watch    # Watch mode
```

### Storybook

```bash
npm run storybook             # Open Storybook (port 6006)
npm run build-storybook       # Build for deployment
```

### Linting & formatting

```bash
npm run lint      # ESLint (.js, .jsx)
npm run format    # Prettier
```

## Documentation

```bash
# GitBook
docs/SUMMARY.md        # Table of contents
docs/README.md          # Cover page
docs/                  # All chapter files

# Backend docs
backend_docs/README.md   # Backend overview
backend_docs/00-infrastructure.md  # Architecture details
backend_docs/01-security.md       # Security details
...

# Frontend docs
frontend_docs/README.md  # Frontend overview
frontend_docs/00-stencil-app-css.md # App & CSS details
...

# API docs
swagger.yaml             # OpenAPI 3.1.0 spec
npm run swagger-serve    # Validate spec
```

## Environment variables

### Backend examples

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate password pepper
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Verify environment
npm start
# Console output shows loaded env vars
```

### Frontend examples

```bash
# Development
export VITE_API_URL=http://localhost:3003/api/v1
npm run dev

# Production
echo "VITE_API_URL=https://api.your-domain.com/api/v1" > .env
npm run build
```

## Troubleshooting

### Backend

| Error | Solution |
|-------|----------|
| `DB_USER` not set | Create `.env` with database credentials |
| `PASSWORD_PEPPER must be set and at least 32 chars` | Generate and set PASSWORD_PEPPER |
| PostgreSQL connection error | Check DB_HOST, DB_PORT, DB_NAME |
| Redis connection error | Service continues without Redis |

### Frontend

| Error | Solution |
|-------|----------|
| Vite 404 | Check port 5173 is free |
| API connection refused | Backend must be running on port 3003 |
| hCaptcha errors | Set `HCAPTCHA_ENABLED=false` for dev |

### Database

| Error | Solution |
|-------|----------|
| Extension 'postgis' not found | `CREATE EXTENSION postgis;` |
| Extension 'pgcrypto' not found | `CREATE EXTENSION pgcrypto;` |
| Migration failed | Check migration SQL syntax |
| Node type ↔ child table inconsistency | Insert into child table BEFORE node creation |