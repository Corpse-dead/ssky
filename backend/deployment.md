# SSKY Printing Backend Deployment Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account
- Cloudinary account
- Domain/VPS for deployment

## Local Development Setup

1. **Clone and Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
Create `.env` file with required variables (see .env.example)

3. **Database Setup**
- Create MongoDB Atlas cluster
- Get connection string
- Create admin user:
```bash
npm run create-admin
```

4. **Start Development Server**
```bash
npm run dev
```

## Production Deployment

### Option 1: VPS Deployment (Ubuntu)

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

2. **Deploy Application**
```bash
# Clone repository
git clone <your-repo-url>
cd ssky-backend

# Install dependencies
npm install --production

# Create production env file
cp .env.example .env.production
# Edit with production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name api.sskyprinting.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL Certificate**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.sskyprinting.com
```

### Option 2: Vercel/Railway Deployment

1. **Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

2. **Environment Variables**
Set all required environment variables in Railway dashboard

### Option 3: Docker Deployment

1. **Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

2. **Docker Compose**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
```

## Environment Variables Setup

### MongoDB Atlas
1. Create cluster at atlas.mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Get connection string

### Cloudinary Setup
1. Sign up at cloudinary.com
2. Get API credentials from dashboard
3. Configure upload presets

## Security Checklist

- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] SSL certificate installed
- [ ] Regular backups scheduled
- [ ] Monitoring setup

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 restart all
```

### Log Management
```bash
# Rotate logs
pm2 install pm2-logrotate

# Monitor errors
tail -f ~/.pm2/logs/app-error.log
```

## API Documentation

Base URL: `https://api.sskyprinting.com/api`

### Endpoints

#### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

#### Custom Orders
- `POST /custom-orders` - Create custom order
- `GET /custom-orders` - Get all orders (Admin)
- `GET /custom-orders/:id` - Get single order
- `PUT /custom-orders/:id` - Update order (Admin)

#### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Admin logout
- `GET /auth/me` - Get current admin

## Backup Strategy

### Database Backup
```bash
# Daily backup script
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb+srv://..." /backups/20231201
```

### File Backup
- Cloudinary handles image backups
- Code repository on Git
- Environment configs secured separately

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string

2. **Image Upload Fails**
   - Check Cloudinary credentials
   - Verify file size limits

3. **High Memory Usage**
   - Monitor with `pm2 monit`
   - Increase server resources if needed

4. **API Rate Limiting**
   - Adjust rate limit settings
   - Implement request caching

### Health Checks
```bash
# API health
curl https://api.sskyprinting.com/api/health

# Database connection
curl https://api.sskyprinting.com/api/products?limit=1
```
