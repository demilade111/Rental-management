# Docker Setup for Rental Management System

This document provides instructions for running the rental management system using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher

## Quick Start

1. **Clone and navigate to the project directory:**

   ```bash
   cd /Users/dez/Desktop/Projects/Project/Rental-managament
   ```

2. **Create environment file:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your preferred settings.

3. **Start all services:**

   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173 (development) or http://localhost:80 (production)
   - Backend API: http://localhost:4000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Services

### Backend (Node.js + Express + Prisma)

- **Port:** 4000
- **Database:** PostgreSQL with Prisma ORM
- **Features:** Multi-stage build, security hardening, health checks

### Frontend (React + Vite)

- **Port:** 5173 (dev) / 80 (production)
- **Features:** Nginx serving, optimized builds, client-side routing

### Database (PostgreSQL)

- **Port:** 5432
- **Database:** rental_management
- **Features:** Persistent storage, health checks

### Cache (Redis)

- **Port:** 6379
- **Features:** Optional caching layer

## Development vs Production

### Development Mode

```bash
# Start in development mode
NODE_ENV=development docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Mode

```bash
# Start in production mode
NODE_ENV=production docker-compose up -d

# Build and start
docker-compose up --build -d
```

## Useful Commands

### Container Management

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart specific service
docker-compose restart backend
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec backend npx prisma migrate deploy

# Open Prisma Studio
docker-compose exec backend npx prisma studio

# Reset database
docker-compose down -v
docker-compose up -d
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## Environment Variables

Create a `.env` file in the root directory with:

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/rental_management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=4000
VITE_API_URL=http://localhost:4000
REDIS_URL=redis://localhost:6379
```

## Troubleshooting

### Common Issues

1. **Port conflicts:** Ensure ports 4000, 5173, 5432, and 6379 are available
2. **Database connection:** Wait for PostgreSQL to be healthy before starting backend
3. **Permission issues:** Check file permissions in mounted volumes

### Debugging

```bash
# Check container health
docker-compose ps

# View detailed logs
docker-compose logs --tail=100 backend

# Inspect container
docker inspect rental-backend
```

## Security Notes

- Change default passwords in production
- Use strong JWT secrets
- Configure proper CORS settings
- Enable HTTPS in production
- Regular security updates for base images

