# راهنمای استقرار پروژه LEAD بر روی سرور

## 📦 فایل‌های بیلد شده

بیلد production پروژه در پوشه `build` قرار دارد.

## 🌐 دامنه
- **دامنه**: `app.leadmapro.com`
- **محل استقرار**: سرور

## 📋 مراحل استقرار

### 1. آپلود فایل‌ها
تمام محتویات پوشه `build` را به سرور آپلود کنید:
```bash
# از طریق FTP/SFTP یا rsync
rsync -avz build/ user@server:/path/to/app.leadmapro.com/
```

### 2. تنظیمات Apache/Nginx

#### برای Apache:
فایل `.htaccess` به صورت خودکار در پوشه `build` قرار گرفته است که شامل:
- ✅ Redirect HTTP به HTTPS
- ✅ پشتیبانی از React Router (SPA)
- ✅ فشرده‌سازی GZIP
- ✅ کش مرورگر
- ✅ هدرهای امنیتی

مطمئن شوید که `mod_rewrite` فعال است:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### برای Nginx:
اگر از Nginx استفاده می‌کنید، تنظیمات زیر را به فایل کانفیگ اضافه کنید:

```nginx
server {
    listen 80;
    server_name app.leadmapro.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.leadmapro.com;
    
    # SSL Certificate paths
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    root /path/to/app.leadmapro.com;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy (if needed)
    location /api {
        proxy_pass http://backend-server:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. تنظیمات SSL
برای دامنه `app.leadmapro.com` حتماً SSL نصب کنید:

#### استفاده از Let's Encrypt (رایگان):
```bash
sudo apt-get install certbot python3-certbot-apache
sudo certbot --apache -d app.leadmapro.com
```

یا برای Nginx:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d app.leadmapro.com
```

### 4. تنظیمات DNS
مطمئن شوید که رکورد DNS برای `app.leadmapro.com` به IP سرور شما اشاره می‌کند:
```
Type: A
Name: app
Value: [IP سرور شما]
TTL: 3600
```

### 5. تنظیمات Backend API
در فایل‌های محیطی پروژه، آدرس API را به آدرس واقعی backend تغییر دهید.

اگر API شما روی همان سرور است:
- آدرس API: `https://app.leadmapro.com/api`

اگر API روی سرور جداگانه است:
- آدرس API: `https://api.leadmapro.com`

### 6. بررسی نهایی
پس از استقرار، موارد زیر را بررسی کنید:
- ✅ سایت از طریق HTTPS قابل دسترسی است
- ✅ Routing در SPA به درستی کار می‌کند (رفرش صفحه 404 ندهد)
- ✅ فایل‌های استاتیک (CSS, JS, تصاویر) لود می‌شوند
- ✅ API calls به درستی کار می‌کنند
- ✅ CORS تنظیم شده است (در صورت نیاز)

## 🔧 نکات مهم

1. **Environment Variables**: 
   - در حال حاضر پروژه از proxy استفاده می‌کند
   - برای production باید آدرس API را مستقیماً تنظیم کنید

2. **CORS**: 
   - مطمئن شوید backend شما درخواست‌ها از `app.leadmapro.com` را می‌پذیرد

3. **Performance**:
   - فایل‌های JavaScript و CSS به صورت خودکار minify شده‌اند
   - از CDN برای بهبود سرعت استفاده کنید (اختیاری)

4. **Monitoring**:
   - لاگ‌های سرور را برای خطاهای احتمالی بررسی کنید
   - از ابزارهایی مثل Google Analytics یا Sentry استفاده کنید

## 📊 ساختار فایل‌های بیلد

```
build/
├── index.html          # فایل اصلی HTML
├── .htaccess          # تنظیمات Apache
├── assets/            # فایل‌های JavaScript و CSS
│   ├── *.js          # فایل‌های JavaScript minified
│   └── *.css         # فایل‌های CSS minified
└── [سایر فایل‌های استاتیک]
```

## 🚀 دستورات مفید

### بیلد مجدد:
```bash
npm run build
```

### پاک کردن cache:
```bash
rm -rf build
npm run build
```

### تست local بیلد production:
```bash
npm install -g serve
serve -s build -p 3000
```

## 📞 پشتیبانی
در صورت بروز مشکل در استقرار، موارد زیر را بررسی کنید:
1. لاگ‌های سرور وب (Apache/Nginx)
2. Console مرورگر برای خطاهای JavaScript
3. Network tab برای بررسی درخواست‌های API
4. تنظیمات فایروال و پورت‌ها

---
**نسخه**: 1.0.7  
**تاریخ بیلد**: 2026-02-16  
**محیط**: Production
