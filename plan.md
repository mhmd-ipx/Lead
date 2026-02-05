# Deployment Fix Plan for LEAD Project

## Problem Analysis
The React app built with Vite is deployed to a DirectAdmin hosting environment, but the page appears blank with 404 errors for:
- `assets/index-iVKoSE6b.js` (main JavaScript bundle)
- `favicon.ico`

## Root Cause Assessment
1. **Build Output**: The `build/` folder contains all necessary files including `index.html`, `assets/`, and `favicon.ico`.
2. **Path Issues**: The HTML references assets with absolute paths (`/assets/...`), which work if deployed to domain root but fail if in a subdirectory.
3. **SPA Routing**: DirectAdmin (Apache-based) needs configuration to handle client-side routing for non-root paths.
4. **Deployment Method**: Likely the `build` folder was uploaded as-is instead of its contents, or assets weren't uploaded properly.

## Proposed Solution Steps

### 1. Verify Deployment Location
- Confirm if the app is deployed to the domain root (`https://yourdomain.com/`) or a subdirectory (`https://yourdomain.com/app/`).
- If subdirectory, the Vite `base` configuration needs adjustment.

### 2. Update Vite Configuration (if needed)
- If app is in subdirectory, modify `vite.config.ts` to set `base: '/subdirectory/'` and rebuild.
- Current config has no base set (defaults to `/`).

### 3. Prepare Build for Upload
- Extract contents of `build/` folder (not the folder itself) to upload location.
- Ensure all files from `build/assets/`, `build/favicon.ico`, etc. are uploaded to domain root.

### 4. Add Apache Configuration for SPA
- Create `.htaccess` file in the upload directory with rewrite rules for client-side routing.
- Content:
  ```
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  ```

### 5. Redeploy and Test
- Upload all build contents and `.htaccess` to the domain's document root (typically `public_html`).
- Clear browser cache and test the application.
- Verify assets load correctly and routing works.

### 6. Additional Checks
- Ensure mod_rewrite is enabled on the server.
- Check file permissions (assets should be readable).
- Verify domain DNS points to correct server.

## Expected Outcome
- Main page loads without 404 errors.
- Assets load correctly.
- Client-side routing works for all app routes.
- App functions normally on the domain.

Please review this plan. If you approve, I can proceed to implement the necessary changes and provide deployment instructions.