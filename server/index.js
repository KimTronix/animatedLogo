const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

// --- CONFIGURATION ---
const app = express();
const PORT = 3006;
const CONTENT_DIR = path.join(__dirname, '../vod_content');
const THUMB_DIR = path.join(__dirname, 'thumbnails');

// --- PRE-FLIGHT CHECKS ---
if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Range', 'Accept'],
    credentials: true
}));

// Robust Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    console.log(`   - Origin: ${req.get('origin') || 'Native App'}`);
    console.log(`   - User-Agent: ${req.get('user-agent')}`);
    next();
});

// --- HELPERS ---
const generateThumbnail = (videoPath, thumbPath) => {
    return new Promise((resolve) => {
        const cmd = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 -s 320x180 "${thumbPath}" -y`;
        exec(cmd, (error) => {
            if (error) {
                console.error(`- Error generating thumb for ${path.basename(videoPath)}`);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

const getVideos = async (host) => {
    try {
        const files = await fs.promises.readdir(CONTENT_DIR);
        const videoFiles = files.filter(f => ['.mp4', '.mov', '.m4v'].includes(path.extname(f).toLowerCase()));

        const videoPromises = videoFiles.map(async file => {
            const thumbName = `${file}.jpg`;
            const thumbPath = path.join(THUMB_DIR, thumbName);
            const videoPath = path.join(CONTENT_DIR, file);

            if (!fs.existsSync(thumbPath)) {
                await generateThumbnail(videoPath, thumbPath);
            }

            return {
                id: encodeURIComponent(file),
                name: file,
                url: `http://${host}/content/${encodeURIComponent(file)}`,
                thumbnail: fs.existsSync(thumbPath) ? `http://${host}/thumbs/${encodeURIComponent(thumbName)}` : null
            };
        });

        return await Promise.all(videoPromises);
    } catch (err) {
        console.error("Error reading videos:", err);
        return [];
    }
};

// --- ROUTES ---

// 1. DASHBOARD (HTML)
app.get('/', async (req, res) => {
    const host = req.get('host');
    const videos = await getVideos(host);
    const nets = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
        }
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AOK VOD Dashboard</title>
        <style>
            body { background: #000; color: #fff; font-family: sans-serif; padding: 40px; }
            .ruby { color: #9B111E; }
            .card { background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222; margin-bottom: 20px; }
            .ip { font-family: monospace; color: #9B111E; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
            .video { background: #0a0a0a; border-radius: 8px; overflow: hidden; border: 1px solid #222; }
            .video img { width: 100%; aspect-ratio: 16/9; object-fit: cover; background: #000; }
            .video-info { padding: 12px; }
            h2 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
            .btn { background: #9B111E; color: #fff; text-decoration: none; padding: 8px 16px; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>AOK <span class="ruby">VOD</span> SERVER</h1>
        <div class="card">
            <h2>Mobile Connection Settings</h2>
            <p>Enter this IP in your mobile app:</p>
            ${ips.map(ip => `<div class="ip">${ip}</div>`).join('')}
            <div style="margin-top: 20px;">
                <a href="/api/videos" class="btn">TEST API JSON</a>
            </div>
        </div>
        <div class="grid">
            ${videos.length === 0 ? '<p>No videos found in vod_content/</p>' : videos.map(v => `
                <div class="video">
                    ${v.thumbnail ? `<img src="${v.thumbnail}" />` : '<div style="aspect-ratio:16/9; background:#111;"></div>'}
                    <div class="video-info">
                        <div style="margin-bottom: 10px; font-weight: bold;">${v.name}</div>
                        <a href="${v.url}" class="btn" target="_blank">PLAY VIDEO</a>
                    </div>
                </div>
            `).join('')}
        </div>
    </body>
    </html>
    `);
});

// 2. API (JSON for Mobile App)
app.get('/api/videos', async (req, res) => {
    const host = req.get('host');
    const videos = await getVideos(host);
    res.json({ videos, status: 'ok', count: videos.length });
});

// Backward compatibility (old link)
app.get('/videos', (req, res) => res.redirect('/api/videos'));

// 3. STREAMING (Optimized for Mobile)
app.get('/content/:filename', (req, res) => {
    const filePath = path.join(CONTENT_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).end();

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': (end - start) + 1,
            'Content-Type': 'video/mp4',
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': stat.size,
            'Content-Type': 'video/mp4',
        });
        fs.createReadStream(filePath).pipe(res);
    }
});

// 4. THUMBNAILS
app.use('/thumbs', express.static(THUMB_DIR));

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 AOK VOD SERVER ONLINE`);
    console.log(`🖥️  Dashboard: http://localhost:${PORT}`);
    console.log(`📱 API: http://localhost:${PORT}/api/videos`);
    console.log(`-------------------------------------------`);
    console.log(`Server is listening and ready for connections...`);
    console.log(`Press Ctrl+C to stop\n`);
});

// Keep process alive
setInterval(() => {
    // Heartbeat to prevent process exit
}, 30000);

// Error handlers
server.on('error', (err) => {
    console.error('\n❌ SERVER ERROR:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Kill it with: lsof -ti:${PORT} | xargs kill -9`);
    }
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('\n⚠️  UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n⚠️  UNHANDLED REJECTION:', reason);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
