# Deployment Guide

## Backend

### Prerequisites

```
- Node.js 20+
- PostgreSQL 16+ with PostGIS, pgcrypto
- Redis (recommended)
```

### 1. Configure environment

```bash
cd backend
# Create .env
cp .env.example .env
```

Edit `.env`:
```
DB_USER=postgres
DB_PASSWORD=your_secret_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dream_journal
JWT_SECRET=64-char-hex-secret
JWT_EXPIRES_IN=24h
PASSWORD_PEPPER=at-least-32-chars-here
REDIS_URL=redis://localhost:6379
HCAPTCHA_SECRET_KEY=your_key
HCAPTCHA_ENABLED=true
```

Password pepper generation:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Run migrations

```bash
npm install
npm run build
npm run migrate
```

### 3. Start

```bash
npm run dev           # Development (nodemon)
npm run start         # Production: `node dist/index.js`
```

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_USER` | ✅ | — | PostgreSQL user |
| `DB_PASSWORD` | ✅ | — | PostgreSQL password |
| `DB_HOST` | ❌ | `localhost` | PostgreSQL host |
| `DB_PORT` | ❌ | `5432` | PostgreSQL port |
| `DB_NAME` | ❌ | `dream_journal` | Database name |
| `JWT_SECRET` | ✅ | — | JWT signing secret |
| `JWT_EXPIRES_IN` | ❌ | `24h` | Token expiration |
| `PASSWORD_PEPPER` | ✅ | — | Min 32 chars |
| `REDIS_URL` | ❌ | `redis://localhost:6379` | Redis URL |
| `HCAPTCHA_SECRET_KEY` | ❌ | — | hCaptcha secret |
| `HCAPTCHA_ENABLED` | ❌ | `true` | Enable hCaptcha |

## Frontend

### 1. Configure environment

```bash
cd frontend
echo "VITE_API_URL=https://your-api-domain/api/v1" > .env
```

### 2. Build and serve

```bash
npm install
npm run build
# dist/ contains production build
# Serve with Nginx:
# server {
#   listen 80;
#   location / {
#     root /path/to/frontend/dist;
#     try_files $uri $uri/ /index.html;
#   }
# }
```

### Reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend
    location /api/ {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker Compose (example)

```yaml
version: '3'
services:
  postgres:
    image: postgis/postgis:16-3.5
    environment:
      POSTGRES_DB: dream_journal
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      REDIS_URL: redis://redis:6379
    ports:
      - "3003:3003"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
  redis-data:
```