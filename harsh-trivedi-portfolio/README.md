# Harsh Trivedi Portfolio — Full Project

A responsive portfolio website with an Express server, JSON-file data storage, protected admin dashboard, and file uploads.

## Requirements
- Node.js 18 or newer
- npm

## 1. Install and run (Windows PowerShell)
Open PowerShell inside this project folder and run:

```powershell
npm install
$env:ADMIN_USER="admin"
$env:ADMIN_PASSWORD="Choose-A-Strong-Password-Here"
$env:SESSION_SECRET="replace-this-with-a-long-random-secret"
npm start
```

Open:
- Public website: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin.html

Use username `admin` and the password you set in `ADMIN_PASSWORD`.

**Important:** On the first start, the server creates `data/users.json` using the environment variables if there are no admin users yet. If you already started without setting these variables, stop the server, delete `data/users.json`, set the variables, and start again. Do not delete `data/content.json` if you want to keep your portfolio content.

## 2. Add and edit content
1. Open `/admin.html`.
2. Log in with your admin credentials.
3. Edit Profile fields.
4. Add/remove projects, skills, programming languages, experience, education, certifications and achievements.
5. Click **Save all changes**.
6. Refresh the public website.

You can upload JPG, PNG, WEBP, GIF images or PDF files up to 5 MB. Uploading returns a URL. Use that URL in your resume field or project URL as appropriate. (This starter version shows project titles and details; it does not yet render project thumbnails.)

## 3. Where data is stored
- `data/content.json`: created automatically at first run; contains portfolio content.
- `data/users.json`: admin username and password hash.
- `uploads/`: uploaded files.
- `public/`: website and admin frontend.

Runtime JSON files and uploads are excluded from Git by `.gitignore` so personal content/uploads are not accidentally pushed.

## 4. Run on your local network
Keep the server running. Find your PC's local IPv4 address with `ipconfig`. On another device connected to the same Wi-Fi, open `http://YOUR-PC-IP:3000`. Windows Firewall may ask permission; allow Node.js on private networks only. Do not expose this development server directly to the public internet.

## 5. Before public deployment
- Use a hosting provider that supports Node.js and persistent disk, or move data/uploads to a database/object storage.
- Set `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET` as hosting environment variables.
- Use HTTPS and `NODE_ENV=production`.
- Use a strong unique admin password. Change the default profile email/social links in Admin.
- This starter uses a JSON file for simple personal use; it is not designed for concurrent edits or serverless hosts with ephemeral filesystems.
- For production, replace the default in-memory session store with a persistent session store and consider stronger password hashing/rate limiting.

## Troubleshooting
- `npm` PowerShell script policy error: use `npm.cmd install` and `npm.cmd start`.
- `EADDRINUSE`: port 3000 is already occupied; stop the other server or set `$env:PORT="3001"`.
- Admin says not configured: set environment variables before the first start, or remove `data/users.json` and restart to create the initial admin.
