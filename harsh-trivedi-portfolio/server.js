const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const CONTENT_FILE = path.join(DATA, 'content.json');
const USERS_FILE = path.join(DATA, 'users.json');
const UPLOADS = path.join(ROOT, 'uploads');

for (const dir of [DATA, UPLOADS]) fs.mkdirSync(dir, { recursive: true });

const initialContent = {
  profile: {
    name: 'Harsh Trivedi',
    headline: 'Computer Science Engineering Student & Developer',
    intro: 'I build useful digital experiences and keep learning by making real projects.',
    about: 'I am a CSE student interested in web development, software engineering and creative technology.',
    location: 'India',
    email: 'your-email@example.com',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    resumeUrl: '',
    availability: 'Open to internships and collaboration'
  },
  projects: [
    { id: 'campus-loop', title: 'Campus Loop', description: 'A campus platform for student updates, attendance, events and learning tools.', tech: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express'], link: '', featured: true },
    { id: 'worldos', title: 'WORLDOS', description: 'An interactive digital-world project exploring city information and visual experiences.', tech: ['HTML', 'CSS', 'JavaScript'], link: '', featured: true }
  ],
  skills: [
    { id: 'skill-html', name: 'HTML', level: 'Learning', category: 'Web Development' },
    { id: 'skill-css', name: 'CSS', level: 'Learning', category: 'Web Development' },
    { id: 'skill-js', name: 'JavaScript', level: 'Learning', category: 'Programming' },
    { id: 'skill-cpp', name: 'C++', level: 'Learning', category: 'Programming' }
  ],
  languages: [
    { id: 'lang-cpp', name: 'C++', level: 'Learning' },
    { id: 'lang-c', name: 'C', level: 'Learning' },
    { id: 'lang-js', name: 'JavaScript', level: 'Learning' }
  ],
  experience: [],
  education: [
    { id: 'edu-btech', title: 'B.Tech — Computer Science Engineering', organization: 'Kanpur Institute of Technology', period: '2026 – Present', description: 'Undergraduate student.' }
  ],
  certifications: [],
  achievements: [],
  socialLinks: [
    { id: 'social-github', label: 'GitHub', url: 'https://github.com/' },
    { id: 'social-linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' }
  ]
};

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { fs.writeFileSync(file, JSON.stringify(fallback, null, 2)); return fallback; }
}
function writeContent(content) { fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2)); }
readJson(CONTENT_FILE, initialContent);
const users = readJson(USERS_FILE, []);
if (!users.length && process.env.ADMIN_PASSWORD) {
  users.push({ username: process.env.ADMIN_USER || 'admin', passwordHash: hashPassword(process.env.ADMIN_PASSWORD) });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function hashPassword(password) { return crypto.createHash('sha256').update(password).digest('hex'); }

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 2 * 60 * 60 * 1000 }
}));
app.use('/uploads', express.static(UPLOADS));
app.use(express.static(path.join(ROOT, 'public')));

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'Please log in as admin first.' });
}
app.get('/api/content', (req, res) => res.json(readJson(CONTENT_FILE, initialContent)));
app.get('/api/admin/status', (req, res) => res.json({ loggedIn: !!(req.session && req.session.admin) }));

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const adminUsers = readJson(USERS_FILE, []);
  if (!adminUsers.length) {
    return res.status(503).json({ error: 'Admin is not configured. Set ADMIN_USER and ADMIN_PASSWORD environment variables, then restart the server.' });
  }
  const user = adminUsers.find(u => u.username === username && u.passwordHash === hashPassword(password || ''));
  if (!user) return res.status(401).json({ error: 'Incorrect username or password.' });
  req.session.admin = user.username;
  res.json({ ok: true, username: user.username });
});
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});
app.put('/api/admin/content', requireAdmin, (req, res) => {
  const content = req.body;
  if (!content || typeof content !== 'object' || !content.profile || !Array.isArray(content.projects)) {
    return res.status(400).json({ error: 'Invalid portfolio data.' });
  }
  writeContent(content);
  res.json({ ok: true });
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, Date.now() + '-' + crypto.randomBytes(5).toString('hex') + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP, GIF images and PDF files are allowed.'));
  }
});
app.post('/api/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a file first.' });
  res.json({ ok: true, url: '/uploads/' + req.file.filename, filename: req.file.filename });
});
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  if (err) return res.status(400).json({ error: err.message || 'Request failed.' });
  res.status(500).json({ error: 'Server error.' });
});

app.listen(PORT, () => console.log(`Harsh Trivedi Portfolio running at http://localhost:${PORT}`));
