# PunyaSeva — Deployment Guide

## Current Production Stack

| Component | Technology |
|-----------|-----------|
| Server | AWS EC2 (Ubuntu) |
| Process manager | PM2 (fork mode) |
| Reverse proxy | Nginx |
| App port | 5000 (internal) |
| Public URL | https://pre.punyaseva.in |
| Database | MySQL 8 (`divine_connect`) |
| Runtime | Node.js 22 + tsx (TypeScript direct) |

---

## Fresh Server Setup

### 1. System dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2
```

### 2. MySQL

```bash
sudo mysql_secure_installation

sudo mysql <<SQL
CREATE DATABASE divine_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'divineuser'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON divine_connect.* TO 'divineuser'@'localhost';
FLUSH PRIVILEGES;
SQL
```

### 3. Clone and install

```bash
cd /var/www/html
git clone <repository-url> divine-connect
cd divine-connect
npm install
```

### 4. Environment variables

```bash
cp .env.example .env
nano .env   # fill in all values
```

Minimum required for production:

```env
NODE_ENV=production
PORT=5000
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_USER=divineuser
MYSQL_PASSWORD=your_strong_password
MYSQL_DATABASE=divine_connect
# REQUIRED — server exits at startup if this is missing or default in production
JWT_SECRET=<64+ char random hex — run: openssl rand -hex 48>
GEMINI_API_KEY=your_key
OPENROUTER_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
VITE_STRIPE_PUBLISHABLE_KEY=your_key
VITE_APP_URL=https://yourdomain.com
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@punyaseva.in
```

### 5. Build

```bash
npm run build
```

### 6. Database seed & migrations

The server auto-creates all tables on first boot. After it starts, seed and apply migrations:

```bash
# Seed 40 products, pujas, yatras, feedback (idempotent — safe to re-run)
mysql -u divineuser -p divine_connect < database/seed.sql

# Apply schema migrations (new columns, indexes, yatras table)
mysql -u divineuser -p divine_connect < database/migrations/001_add_missing_columns_and_yatras.sql
mysql -u divineuser -p divine_connect < database/migrations/002_add_performance_indexes.sql
```

### 7. Start with PM2

```bash
pm2 start "npx tsx server.ts" --name divine-connect
pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

---

## Nginx Configuration

```nginx
# /etc/nginx/sites-available/punyaseva
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 10M;   # allow product image uploads

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

```bash
sudo ln -s /etc/nginx/sites-available/punyaseva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Deploying Updates

```bash
cd /var/www/html/divine-connect
git pull origin main
npm install                              # only if package.json changed
npm run build
pm2 restart divine-connect --update-env
```

If the database schema changed (new columns or tables):

```bash
# Run the relevant migration file
mysql -u divineuser -p divine_connect < database/migrations/001_add_missing_columns_and_yatras.sql
mysql -u divineuser -p divine_connect < database/migrations/002_add_performance_indexes.sql
```

---

## PM2 Cheatsheet

```bash
pm2 status                          # process list
pm2 logs divine-connect --lines 50  # tail logs
pm2 restart divine-connect          # restart
pm2 restart divine-connect --update-env  # restart + reload .env
pm2 stop divine-connect             # stop
pm2 delete divine-connect           # remove from PM2
```

Logs are written to:
- `~/.pm2/logs/divine-connect-out.log` — stdout
- `~/.pm2/logs/divine-connect-error.log` — stderr

---

## Health Check

```bash
curl http://localhost:5000/api/health
# {"status":"ok"}
```

---

## Monitoring

| What | Where |
|------|-------|
| Server logs | `pm2 logs divine-connect` |
| Error log | `~/.pm2/logs/divine-connect-error.log` |
| MySQL queries | `sudo mysqladmin -u root -p processlist` |
| Nginx access | `/var/log/nginx/access.log` |
| Nginx errors | `/var/log/nginx/error.log` |
| Disk / memory | `htop`, `df -h` |

---

## Backup

```bash
# Database dump
mysqldump -u divineuser -p divine_connect > backup_$(date +%Y%m%d).sql

# Product images
tar -czf products_backup_$(date +%Y%m%d).tar.gz /var/www/html/divine-connect/public/products/
```

---

## TODO Before Public Launch

### Critical (P1)
- [ ] Set real Stripe keys (`STRIPE_SECRET_KEY` + `VITE_STRIPE_PUBLISHABLE_KEY`)
- [ ] Configure SMTP credentials for OTP email delivery (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)
- [ ] Rotate any credentials that were previously exposed — see security audit notes

### Recommended (P2)
- [ ] Upgrade Gemini to a paid key (free-tier quota exhausted on heavy usage)
- [ ] Set up automated database backups (cron + S3 or mysqldump to remote storage)
- [ ] Configure PM2 log rotation: `pm2 install pm2-logrotate`
- [ ] Restrict Firebase API key to specific domains in Google Cloud Console
- [ ] Run `npm audit fix` after each Firebase Admin SDK update to clear transitive vulnerabilities

### Infrastructure (P3)
- [ ] Harden MySQL: disable remote root login, restrict `divineuser` to localhost only
- [ ] Move product image uploads from local filesystem to S3/GCS for multi-instance scalability
- [ ] Add Redis for distributed rate limiting and session caching
- [ ] Set up Sentry or similar for error tracking and performance monitoring
