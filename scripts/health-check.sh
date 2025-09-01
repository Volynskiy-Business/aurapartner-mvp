#!/bin/bash

# Check frontend
curl -f http://localhost:3000/api/health || exit 1

# Check backend
curl -f http://localhost:5000/health || exit 1

# Check Docker services
docker-compose ps | grep -E "qdrant|redis|postgres" | grep -v "Exit" || exit 1

echo "All services healthy"
