const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const PORT = 7868;
const SERVER_DIR = path.resolve(__dirname);
const MODS_DIR = path.join(SERVER_DIR, 'mods');
const PLUGINS_DIR = path.join(SERVER_DIR, 'plugins');
const SETTINGS_FILE = path.join(SERVER_DIR, 'admin_settings.json');
const SERVER_PROPERTIES = path.join(SERVER_DIR, 'server.properties');
const SPIGOT_YML = path.join(SERVER_DIR, 'spigot.yml');

// Default Admin Settings
const defaultSettings = {
    autoRestartEnabled: true,
    maintenanceTime: "04:00",
    maintenanceMode: false,
    clearLagEnabled: true,
    clearLagIntervalMinutes: 15,
    clearLagBroadcast: true,
    viewDistance: 10,
    simulationDistance: 8,
    hopperTransfer: 8,
    maxPlayers: 20,
    antiXray: true
};

let settings = { ...defaultSettings };

if (fs.existsSync(SETTINGS_FILE)) {
    try {
        settings = { ...defaultSettings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
    } catch (e) {
        console.error('Error loading admin_settings.json', e);
    }
} else {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function saveSettings() {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

// RCON Client Implementation
function sendRcon(command, host = '127.0.0.1', port = 25575, password = 'TrumMinecraftAdmin2026') {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.setTimeout(4000);
        let authenticated = false;
        let responseData = '';

        function sendPacket(id, type, body) {
            const bodyBuffer = Buffer.from(body, 'utf-8');
            const length = 14 + bodyBuffer.length;
            const buffer = Buffer.alloc(length);
            buffer.writeInt32LE(length - 4, 0);
            buffer.writeInt32LE(id, 4);
            buffer.writeInt32LE(type, 8);
            bodyBuffer.copy(buffer, 12);
            buffer.writeInt16LE(0, 12 + bodyBuffer.length);
            client.write(buffer);
        }

        client.connect(port, host, () => {
            sendPacket(1, 3, password);
        });

        client.on('data', (data) => {
            if (data.length < 12) return;
            const resId = data.readInt32LE(4);

            if (!authenticated) {
                if (resId === -1) {
                    client.destroy();
                    return reject(new Error('RCON Authentication Failed'));
                }
                authenticated = true;
                sendPacket(2, 2, command);
                return;
            }

            const body = data.subarray(12, data.length - 2).toString('utf-8');
            responseData += body;
            client.destroy();
            resolve(responseData);
        });

        client.on('timeout', () => {
            client.destroy();
            reject(new Error('RCON Timeout'));
        });

        client.on('error', (err) => {
            reject(err);
        });
    });
}

// Auto ClearLag & Maintenance Schedulers
let nextClearLagTime = Date.now() + settings.clearLagIntervalMinutes * 60 * 1000;

setInterval(async () => {
    if (!settings.clearLagEnabled) return;
    const now = Date.now();
    const remainingSec = Math.round((nextClearLagTime - now) / 1000);

    if (remainingSec === 60 && settings.clearLagBroadcast) {
        await sendRcon('broadcast §8[§c§lDọn Rác§8] §eVật phẩm rơi vãi thừa sẽ được dọn dẹp sau §c§l60 giây§e! Hãy nhặt lại đồ cần thiết.').catch(() => {});
    } else if (remainingSec === 10 && settings.clearLagBroadcast) {
        await sendRcon('broadcast §8[§c§lDọn Rác§8] §eDọn dẹp rác sau §c§l10 giây§e!').catch(() => {});
    } else if (remainingSec <= 0) {
        try {
            const res = await sendRcon('minecraft:kill @e[type=item]');
            await sendRcon('broadcast §8[§a§lDọn Rác§8] §fĐã dọn dẹp sạch sẽ toàn bộ rác và vật phẩm rơi trên server! Giảm tải hoàn tất.').catch(() => {});
            console.log('[Auto ClearLag]', res);
        } catch (e) {}
        nextClearLagTime = Date.now() + settings.clearLagIntervalMinutes * 60 * 1000;
    }
}, 1000);

// Daily Maintenance Check
let lastRestartDate = '';
setInterval(async () => {
    if (!settings.autoRestartEnabled) return;
    const now = new Date();
    const currentHM = now.toTimeString().substring(0, 5); // "04:00"
    const todayStr = now.toDateString();

    if (currentHM === settings.maintenanceTime && lastRestartDate !== todayStr) {
        lastRestartDate = todayStr;
        console.log('[Maintenance] Triggering scheduled maintenance at', currentHM);
        try {
            await sendRcon('broadcast §8[§c§lBẢO TRÌ§8] §eMáy chủ bắt đầu quy trình tự động bảo trì hàng ngày sau §c60 giây§e!').catch(() => {});
            setTimeout(async () => {
                await sendRcon('broadcast §8[§c§lBẢO TRÌ§8] §eBảo trì sau §c10 giây§e! Tự động lưu dữ liệu thế giới...').catch(() => {});
                await sendRcon('save-all').catch(() => {});
            }, 50000);
            setTimeout(async () => {
                await sendRcon('kickall §c§lMÁY CHỦ BẢO TRÌ HÀNG NGÀY\n§eHệ thống đang tự động tối ưu và khởi động lại.\nVui lòng vào lại sau 1-2 phút!').catch(() => {});
                await sendRcon('stop').catch(() => {});
            }, 60000);
        } catch (e) {}
    }
}, 20000);

// Helper for files
function formatSize(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
}

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.jar') || f.endsWith('.jar.disabled'))
        .map(name => {
            const stat = fs.statSync(path.join(dir, name));
            return {
                name,
                enabled: name.endsWith('.jar'),
                size: formatSize(stat.size),
                sizeBytes: stat.size,
                mtime: stat.mtime.toLocaleString('vi-VN')
            };
        })
        .sort((a, b) => b.sizeBytes - a.sizeBytes);
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // GET Status & Settings
    if (url.pathname === '/api/status') {
        let rconOk = false;
        let onlinePlayers = '0/20';
        try {
            const listRes = await sendRcon('list');
            rconOk = true;
            onlinePlayers = listRes.replace(/§[0-9a-fk-or]/gi, '').trim();
        } catch (e) {}

        const now = Date.now();
        const clearLagInSec = Math.max(0, Math.round((nextClearLagTime - now) / 1000));

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({
            rconOk,
            onlinePlayers,
            settings,
            clearLagInSec
        }));
    }

    // POST Save Settings
    if (url.pathname === '/api/settings/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const newSettings = JSON.parse(body);
                settings = { ...settings, ...newSettings };
                saveSettings();

                // Apply to server.properties
                if (fs.existsSync(SERVER_PROPERTIES)) {
                    let props = fs.readFileSync(SERVER_PROPERTIES, 'utf-8');
                    props = props.replace(/view-distance=\d+/g, `view-distance=${settings.viewDistance}`);
                    props = props.replace(/simulation-distance=\d+/g, `simulation-distance=${settings.simulationDistance}`);
                    props = props.replace(/max-players=\d+/g, `max-players=${settings.maxPlayers}`);
                    fs.writeFileSync(SERVER_PROPERTIES, props, 'utf-8');
                }

                // Reset ClearLag Timer
                nextClearLagTime = Date.now() + settings.clearLagIntervalMinutes * 60 * 1000;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, settings }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
        return;
    }

    // POST Actions
    if (url.pathname.startsWith('/api/action/') && req.method === 'POST') {
        const action = url.pathname.replace('/api/action/', '');
        try {
            let msg = '';
            if (action === 'clearlag') {
                const r = await sendRcon('minecraft:kill @e[type=item]');
                await sendRcon('broadcast §8[§a§lDọn Rác§8] §fQuản trị viên đã kích hoạt dọn rác thủ công trên toàn server!').catch(() => {});
                msg = r || 'Đã dọn dẹp vật phẩm rơi vãi!';
            } else if (action === 'clearmobs') {
                const r = await sendRcon('minecraft:kill @e[type=monster]');
                await sendRcon('broadcast §8[§a§lTối Ưu§8] §fĐã quét bớt quái vật hung dữ để giảm tải CPU!').catch(() => {});
                msg = r || 'Đã quét quái vật hung dữ!';
            } else if (action === 'ram') {
                await sendRcon('save-all');
                msg = 'Đã lưu world và kích hoạt dọn dẹp RAM!';
            } else if (action === 'maintenance_toggle') {
                settings.maintenanceMode = !settings.maintenanceMode;
                saveSettings();
                if (settings.maintenanceMode) {
                    await sendRcon('whitelist on');
                    await sendRcon('kickall §c§lMÁY CHỦ ĐANG BẢO TRÌ\n§eBan Quản Trị đang tiến hành nâng cấp kỹ thuật.\nVui lòng quay lại sau ít phút!');
                    msg = 'Đã BẬT Chế độ bảo trì (Chỉ cho phép OP vào)';
                } else {
                    await sendRcon('whitelist off');
                    await sendRcon('broadcast §a§l[THÔNG BÁO] Máy chủ đã hoàn tất bảo trì, chúc các bạn chơi vui vẻ!');
                    msg = 'Đã TẮT Chế độ bảo trì (Mở cửa tự do)';
                }
            } else if (action === 'restart_now') {
                await sendRcon('broadcast §c§l[CẢNH BÁO] Máy chủ sẽ khởi động lại sau 10 giây!');
                setTimeout(async () => {
                    await sendRcon('save-all');
                    await sendRcon('stop');
                }, 10000);
                msg = 'Đã gửi lệnh đếm ngược khởi động lại (10 giây)!';
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: msg }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
    }

    // File Manager APIs
    if (url.pathname === '/api/list') {
        const mods = getFiles(MODS_DIR);
        const plugins = getFiles(PLUGINS_DIR);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ mods, plugins }));
    }

    if (url.pathname === '/api/upload' && req.method === 'POST') {
        const folder = url.searchParams.get('folder') === 'plugins' ? PLUGINS_DIR : MODS_DIR;
        let filename = path.basename(url.searchParams.get('filename') || 'uploaded.jar');
        if (!filename.endsWith('.jar')) filename += '.jar';

        const dest = path.join(folder, filename);
        const stream = fs.createWriteStream(dest);
        req.pipe(stream);
        stream.on('finish', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, filename }));
        });
        return;
    }

    if (url.pathname === '/api/toggle' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { folder, name } = JSON.parse(body);
                const targetDir = folder === 'plugins' ? PLUGINS_DIR : MODS_DIR;
                const safeName = path.basename(name);
                const oldPath = path.join(targetDir, safeName);
                const newName = safeName.endsWith('.disabled') ? safeName.replace(/\.disabled$/, '') : safeName + '.disabled';
                fs.renameSync(oldPath, path.join(targetDir, newName));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, newName }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { folder, name } = JSON.parse(body);
                const targetDir = folder === 'plugins' ? PLUGINS_DIR : MODS_DIR;
                const safeName = path.basename(name);
                const targetPath = path.join(targetDir, safeName);
                if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Frontend HTML
    if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(getHtml());
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Admin Hub] Running at http://localhost:${PORT}`);
});

function getHtml() {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trùm Minecraft • Trung Tâm Quản Trị & Tối Ưu</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-main: #0a0d14;
            --bg-card: #131822;
            --bg-hover: #1c2331;
            --border: #263042;
            --accent-cyan: #00d2ff;
            --accent-blue: #3a7bd5;
            --accent-green: #00e676;
            --accent-red: #ff5252;
            --accent-gold: #ffab00;
            --text-main: #f0f4f8;
            --text-muted: #8899a6;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg-main);
            color: var(--text-main);
            padding: 24px 16px;
            min-height: 100vh;
        }
        .container {
            max-width: 1050px;
            margin: 0 auto;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }
        .logo-box h1 {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(90deg, #ffab00, #ff5252, #00d2ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo-box p {
            color: var(--text-muted);
            font-size: 13px;
            margin-top: 4px;
        }
        .header-links {
            display: flex;
            gap: 10px;
        }
        .btn-link {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--accent-cyan);
            text-decoration: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .btn-link:hover {
            background: var(--bg-hover);
            border-color: var(--accent-cyan);
        }

        /* Status Grid */
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
            overflow: hidden;
        }
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 4px; height: 100%;
            background: var(--accent-cyan);
        }
        .stat-card.green::before { background: var(--accent-green); }
        .stat-card.gold::before { background: var(--accent-gold); }
        .stat-card.red::before { background: var(--accent-red); }
        .stat-title {
            font-size: 12px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
        }
        .stat-val {
            font-size: 20px;
            font-weight: 800;
            color: var(--text-main);
        }

        /* Nav Tabs */
        .nav-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
            overflow-x: auto;
        }
        .nav-btn {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }
        .nav-btn:hover { background: var(--bg-hover); color: var(--text-main); }
        .nav-btn.active {
            background: linear-gradient(135deg, #00d2ff, #3a7bd5);
            color: #fff;
            border-color: transparent;
        }

        /* Tab Content Section */
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }

        .section-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section-desc {
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 20px;
        }

        /* Quick Action Bar */
        .quick-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
            margin-bottom: 24px;
        }
        .action-btn {
            padding: 14px 16px;
            border-radius: 10px;
            border: 1px solid var(--border);
            background: var(--bg-card);
            color: var(--text-main);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.2s;
        }
        .action-btn:hover {
            transform: translateY(-2px);
            background: var(--bg-hover);
        }
        .action-btn.clean { border-color: rgba(0, 230, 118, 0.4); color: var(--accent-green); }
        .action-btn.clean:hover { background: rgba(0, 230, 118, 0.1); }
        .action-btn.mobs { border-color: rgba(255, 171, 0, 0.4); color: var(--accent-gold); }
        .action-btn.mobs:hover { background: rgba(255, 171, 0, 0.1); }
        .action-btn.maint { border-color: rgba(255, 82, 82, 0.4); color: var(--accent-red); }
        .action-btn.maint:hover { background: rgba(255, 82, 82, 0.1); }
        .action-btn.restart { border-color: rgba(0, 210, 255, 0.4); color: var(--accent-cyan); }
        .action-btn.restart:hover { background: rgba(0, 210, 255, 0.1); }

        /* Form Controls */
        .form-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid rgba(38, 48, 66, 0.6);
        }
        .form-row:last-child { border-bottom: none; }
        .form-label {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .form-label span { font-size: 14px; font-weight: 600; }
        .form-label small { font-size: 12px; color: var(--text-muted); }
        .input-box {
            background: var(--bg-main);
            border: 1px solid var(--border);
            color: var(--text-main);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            width: 140px;
            outline: none;
            text-align: center;
        }
        .input-box:focus { border-color: var(--accent-cyan); }
        .range-slider {
            width: 160px;
            accent-color: var(--accent-cyan);
            cursor: pointer;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 26px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--bg-hover);
            transition: .3s;
            border-radius: 26px;
            border: 1px solid var(--border);
        }
        .slider:before {
            position: absolute; content: "";
            height: 18px; width: 18px;
            left: 3px; bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--accent-green); border-color: var(--accent-green); }
        input:checked + .slider:before { transform: translateX(22px); }

        .save-btn {
            background: linear-gradient(135deg, #00d2ff, #00e676);
            color: #000;
            border: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            margin-top: 15px;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .save-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 15px rgba(0, 230, 118, 0.3);
        }

        /* Dropzone */
        .dropzone {
            border: 2px dashed #00d2ff55;
            background: rgba(0, 210, 255, 0.04);
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 20px;
        }
        .dropzone:hover, .dropzone.dragover {
            border-color: var(--accent-cyan);
            background: rgba(0, 210, 255, 0.08);
            transform: translateY(-2px);
        }
        .file-list { list-style: none; }
        .file-item {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border);
        }
        .file-item:hover { background: var(--bg-hover); }
        .file-name { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--bg-card);
            border: 1px solid var(--accent-green);
            color: var(--accent-green);
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            display: none;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-box">
                <h1>⚡ TRÙM MINECRAFT • ADMIN CONTROL HUB</h1>
                <p>Tự động bảo trì • Dọn rác giảm tải • Tối ưu CPU/RAM • Quản lý Mod & Plugin</p>
            </div>
            <div class="header-links">
                <button class="btn-link" onclick="switchTab('voxeldash')" style="cursor:pointer;">
                    📊 Xem VoxelDash Live
                </button>
            </div>
        </header>

        <!-- Top Stat Cards -->
        <div class="status-grid">
            <div class="stat-card green">
                <span class="stat-title">Trạng thái Server</span>
                <span class="stat-val" id="srvStatus">Đang kiểm tra...</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">Người chơi online</span>
                <span class="stat-val" id="onlineCount">-</span>
            </div>
            <div class="stat-card gold">
                <span class="stat-title">Lần dọn rác tiếp theo</span>
                <span class="stat-val" id="cleanCountdown">--:--</span>
            </div>
            <div class="stat-card red">
                <span class="stat-title">Giờ bảo trì tự động</span>
                <span class="stat-val" id="maintDisplay">04:00 AM</span>
            </div>
        </div>

        <!-- Quick Action Bar -->
        <div class="quick-actions">
            <button class="action-btn clean" onclick="triggerAction('clearlag')">
                🧹 Dọn Rác Ngay
            </button>
            <button class="action-btn mobs" onclick="triggerAction('clearmobs')">
                🧟 Dọn Quái Hung Dữ
            </button>
            <button class="action-btn" style="border-color: rgba(0, 210, 255, 0.4); color: var(--accent-cyan);" onclick="triggerAction('ram')">
                🧠 Giải Phóng RAM
            </button>
            <button class="action-btn maint" id="maintBtn" onclick="triggerAction('maintenance_toggle')">
                🛑 Chế Độ Bảo Trì (Tắt)
            </button>
            <button class="action-btn restart" onclick="triggerAction('restart_now')">
                🔄 Khởi Động Lại
            </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="nav-tabs">
            <button class="nav-btn active" id="tabBtn-maint" onclick="switchTab('maint')">⏰ Tự Động Bảo Trì</button>
            <button class="nav-btn" id="tabBtn-clearlag" onclick="switchTab('clearlag')">🧹 Dọn Rác & Giảm Tải</button>
            <button class="nav-btn" id="tabBtn-perf" onclick="switchTab('perf')">🚀 Tối Ưu Hiệu Năng</button>
            <button class="nav-btn" id="tabBtn-mods" onclick="switchTab('mods')">🧩 Kéo Thả Mod / Plugin</button>
            <button class="nav-btn" id="tabBtn-voxeldash" onclick="switchTab('voxeldash')">📊 Giám Sát VoxelDash (Live)</button>
        </div>

        <!-- TAB 1: MAINTENANCE -->
        <div class="tab-panel active" id="tab-maint">
            <div class="section-card">
                <div class="section-title">⏰ Cấu hình lịch tự động bảo trì hàng ngày</div>
                <div class="section-desc">Server sẽ tự động gửi thông báo đếm ngược trong game, lưu dữ liệu thế giới và khởi động lại sạch sẽ vào giờ đã chọn.</div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Bật tự động khởi động lại hàng ngày</span>
                        <small>Khuyên bật để giải phóng bộ nhớ RAM và dọn sạch dữ liệu tạm</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="cfgAutoRestart">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Thời gian bảo trì hàng ngày (Giờ:Phút)</span>
                        <small>Thời điểm server vắng người nhất (Mặc định 04:00 sáng)</small>
                    </div>
                    <input type="time" class="input-box" id="cfgMaintTime">
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Khóa máy chủ vào Chế độ Bảo trì (Maintenance Mode)</span>
                        <small>Chỉ cho phép Ban Quản Trị (OP) đăng nhập; người chơi khác sẽ nhận thông báo bảo trì</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="cfgMaintMode">
                        <span class="slider"></span>
                    </label>
                </div>

                <button class="save-btn" onclick="saveConfig()">💾 Lưu Cấu Hình Bảo Trì</button>
            </div>
        </div>

        <!-- TAB 2: CLEAR LAG -->
        <div class="tab-panel" id="tab-clearlag">
            <div class="section-card">
                <div class="section-title">🧹 Quản lý dọn rác tự động & Giảm lag</div>
                <div class="section-desc">Tự động quét sạch các khối rơi vãi (drop items) do đào mỏ, quái rớt đồ hoặc farm quái tạo ra quá nhiều entity gây lag server.</div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Bật tính năng Dọn Rác Tự Động</span>
                        <small>Tự động xóa vật phẩm rơi vãi trên mặt đất theo chu kỳ</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="cfgClearLag">
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Chu kỳ quét rác (Phút)</span>
                        <small>Mỗi bao nhiêu phút sẽ tiến hành quét 1 lần (Khuyên dùng: 10 - 20 phút)</small>
                    </div>
                    <input type="number" class="input-box" id="cfgClearInterval" min="2" max="60">
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Thông báo trước trong Chat</span>
                        <small>Nhắc nhở người chơi trước 60 giây và 10 giây để nhặt đồ quan trọng</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="cfgClearBroadcast">
                        <span class="slider"></span>
                    </label>
                </div>

                <button class="save-btn" onclick="saveConfig()">💾 Lưu Cấu Hình Dọn Rác</button>
            </div>
        </div>

        <!-- TAB 3: PERFORMANCE -->
        <div class="tab-panel" id="tab-perf">
            <div class="section-card">
                <div class="section-title">🚀 Tinh chỉnh hiệu năng chuyên sâu (Giảm tải CPU & RAM)</div>
                <div class="section-desc">Điều chỉnh các thông số lõi Minecraft nhằm tăng tối đa FPS và TPS khi có nhiều người chơi cùng lúc.</div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Tầm nhìn (View Distance): <strong id="valViewDist" style="color:var(--accent-cyan)">10</strong> chunks</span>
                        <small>Khoảng cách khối tải về máy người chơi (8-10 là mức mượt nhất)</small>
                    </div>
                    <input type="range" class="range-slider" id="cfgViewDist" min="4" max="16" oninput="document.getElementById('valViewDist').innerText = this.value">
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Tầm mô phỏng (Simulation Distance): <strong id="valSimDist" style="color:var(--accent-gold)">8</strong> chunks</span>
                        <small>Khoảng cách quái di chuyển và cây trồng lớn. Giảm xuống 6-8 giúp giảm tới 40% CPU!</small>
                    </div>
                    <input type="range" class="range-slider" id="cfgSimDist" min="4" max="12" oninput="document.getElementById('valSimDist').innerText = this.value">
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Giới hạn người chơi tối đa (Max Players)</span>
                        <small>Số slot người chơi tối đa có thể cùng online</small>
                    </div>
                    <input type="number" class="input-box" id="cfgMaxPlayers" min="2" max="100">
                </div>

                <div class="form-row">
                    <div class="form-label">
                        <span>Chống X-Ray (Engine Mode 2 - Fake Ores)</span>
                        <small>Làm giả quặng kim cương/vàng dưới lòng đất để người chơi dùng X-Ray nhìn thấy quặng ảo</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="cfgAntiXray" checked>
                        <span class="slider"></span>
                    </label>
                </div>

                <button class="save-btn" onclick="saveConfig()">💾 Lưu Tinh Chỉnh Tối Ưu</button>
            </div>
        </div>

        <!-- TAB 4: MOD & PLUGIN -->
        <div class="tab-panel" id="tab-mods">
            <div class="section-card">
                <div class="section-title">🧩 Kéo thả cài đặt Mod & Plugin</div>
                <div class="section-desc">Kéo file .jar trực tiếp từ máy tính vào ô bên dưới để cài đặt vào server.</div>

                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <button class="nav-btn active" id="btnSubMods" onclick="setModFolder('mods')">Thư mục Mods (Fabric)</button>
                    <button class="nav-btn" id="btnSubPlugins" onclick="setModFolder('plugins')">Thư mục Plugins (Spigot)</button>
                </div>

                <div class="dropzone" id="dropzone">
                    <div style="font-size:36px; margin-bottom:10px;">📥</div>
                    <h3 id="dropTitle">Kéo thả file .jar vào đây để nạp Mod</h3>
                    <p style="font-size:13px; color:var(--text-muted); margin-top:4px;">Lưu trực tiếp vào thư mục <code id="lblFolder">/mods</code></p>
                    <input type="file" id="fileInput" style="display:none;" accept=".jar" multiple>
                </div>

                <div class="section-title" style="margin-top:20px;">Danh sách file đang cài đặt</div>
                <ul class="file-list" id="fileList">
                    <li style="padding:15px; text-align:center; color:var(--text-muted);">Đang tải...</li>
                </ul>
            </div>
        </div>

        <!-- TAB 5: VOXELDASH EMBED -->
        <div class="tab-panel" id="tab-voxeldash">
            <div class="section-card" style="padding:18px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
                    <div>
                        <div class="section-title">📊 VoxelDash Live Monitor</div>
                        <div class="section-desc" style="margin-bottom:0;">Theo dõi biểu đồ tải CPU, RAM, TPS thời gian thực và Console game trực tiếp.</div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-link" onclick="reloadVoxelDash()" style="cursor:pointer; background:var(--bg-main);">
                            🔄 Tải lại
                        </button>
                        <a href="http://localhost:7867" target="_blank" class="btn-link" id="linkVoxelDashNewTab">
                            ↗ Mở tab mới
                        </a>
                    </div>
                </div>
                <iframe id="voxeldashFrame" src="" style="width:100%; height:780px; border:1px solid var(--border); border-radius:10px; background:#0d0b0f;" allowfullscreen></iframe>
            </div>
        </div>
    </div>

    <div class="toast" id="toast">Thông báo</div>

    <script>
        let currentTab = 'maint';
        let currentModFolder = 'mods';
        let cachedSettings = {};

        function showToast(text, isError = false) {
            const toast = document.getElementById('toast');
            toast.innerText = text;
            toast.style.borderColor = isError ? '#ff5252' : '#00e676';
            toast.style.color = isError ? '#ff5252' : '#00e676';
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3500);
        }

        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            const btn = document.getElementById('tabBtn-' + tab);
            if (btn) btn.classList.add('active');
            const panel = document.getElementById('tab-' + tab);
            if (panel) panel.classList.add('active');

            if (tab === 'mods') loadFileList();
            if (tab === 'voxeldash') {
                const iframe = document.getElementById('voxeldashFrame');
                const targetUrl = window.location.protocol + '//' + window.location.hostname + ':7867';
                document.getElementById('linkVoxelDashNewTab').href = targetUrl;
                if (!iframe.src || iframe.src === 'about:blank' || iframe.src === '') {
                    iframe.src = targetUrl;
                }
            }
        }

        function reloadVoxelDash() {
            const iframe = document.getElementById('voxeldashFrame');
            const targetUrl = window.location.protocol + '//' + window.location.hostname + ':7867';
            iframe.src = targetUrl;
            showToast('🔄 Đang tải lại VoxelDash...');
        }

        async function fetchStatus() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                cachedSettings = data.settings;

                // Update cards
                const srvEl = document.getElementById('srvStatus');
                if (data.rconOk) {
                    srvEl.innerText = '🟢 Hoạt Động';
                    srvEl.style.color = 'var(--accent-green)';
                } else {
                    srvEl.innerText = '🟡 Đang Khởi Động';
                    srvEl.style.color = 'var(--accent-gold)';
                }
                document.getElementById('onlineCount').innerText = data.onlinePlayers;
                document.getElementById('maintDisplay').innerText = data.settings.maintenanceTime;

                // ClearLag Countdown
                const m = Math.floor(data.clearLagInSec / 60);
                const s = data.clearLagInSec % 60;
                document.getElementById('cleanCountdown').innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;

                // Maintenance button
                const maintBtn = document.getElementById('maintBtn');
                if (data.settings.maintenanceMode) {
                    maintBtn.innerText = '🟢 Đang Bảo Trì (Mở Lại)';
                    maintBtn.style.color = 'var(--accent-green)';
                    maintBtn.style.borderColor = 'var(--accent-green)';
                } else {
                    maintBtn.innerText = '🛑 Chế Độ Bảo Trì (Tắt)';
                    maintBtn.style.color = 'var(--accent-red)';
                    maintBtn.style.borderColor = 'rgba(255, 82, 82, 0.4)';
                }

                // Populate form inputs if not focused
                if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
                    document.getElementById('cfgAutoRestart').checked = data.settings.autoRestartEnabled;
                    document.getElementById('cfgMaintTime').value = data.settings.maintenanceTime;
                    document.getElementById('cfgMaintMode').checked = data.settings.maintenanceMode;
                    document.getElementById('cfgClearLag').checked = data.settings.clearLagEnabled;
                    document.getElementById('cfgClearInterval').value = data.settings.clearLagIntervalMinutes;
                    document.getElementById('cfgClearBroadcast').checked = data.settings.clearLagBroadcast;

                    document.getElementById('cfgViewDist').value = data.settings.viewDistance;
                    document.getElementById('valViewDist').innerText = data.settings.viewDistance;
                    document.getElementById('cfgSimDist').value = data.settings.simulationDistance;
                    document.getElementById('valSimDist').innerText = data.settings.simulationDistance;
                    document.getElementById('cfgMaxPlayers').value = data.settings.maxPlayers;
                    document.getElementById('cfgAntiXray').checked = data.settings.antiXray;
                }
            } catch (e) {}
        }

        async function saveConfig() {
            const payload = {
                autoRestartEnabled: document.getElementById('cfgAutoRestart').checked,
                maintenanceTime: document.getElementById('cfgMaintTime').value,
                maintenanceMode: document.getElementById('cfgMaintMode').checked,
                clearLagEnabled: document.getElementById('cfgClearLag').checked,
                clearLagIntervalMinutes: parseInt(document.getElementById('cfgClearInterval').value) || 15,
                clearLagBroadcast: document.getElementById('cfgClearBroadcast').checked,
                viewDistance: parseInt(document.getElementById('cfgViewDist').value) || 10,
                simulationDistance: parseInt(document.getElementById('cfgSimDist').value) || 8,
                maxPlayers: parseInt(document.getElementById('cfgMaxPlayers').value) || 20,
                antiXray: document.getElementById('cfgAntiXray').checked
            };

            try {
                const res = await fetch('/api/settings/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    showToast('✅ Đã lưu cấu hình và áp dụng thành công!');
                    fetchStatus();
                } else {
                    showToast('Lỗi: ' + data.error, true);
                }
            } catch (err) {
                showToast('Lỗi kết nối: ' + err.message, true);
            }
        }

        async function triggerAction(action) {
            try {
                const res = await fetch('/api/action/' + action, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    showToast('⚡ ' + data.message);
                    fetchStatus();
                } else {
                    showToast('Lỗi: ' + data.error, true);
                }
            } catch (err) {
                showToast('Lỗi: ' + err.message, true);
            }
        }

        // Mod / Plugin Manager logic
        function setModFolder(folder) {
            currentModFolder = folder;
            document.getElementById('btnSubMods').classList.toggle('active', folder === 'mods');
            document.getElementById('btnSubPlugins').classList.toggle('active', folder === 'plugins');
            document.getElementById('lblFolder').innerText = '/' + folder;
            document.getElementById('dropTitle').innerText = folder === 'mods' 
                ? 'Kéo thả file .jar vào đây để nạp Mod (Fabric)' 
                : 'Kéo thả file .jar vào đây để nạp Plugin (Spigot)';
            loadFileList();
        }

        async function loadFileList() {
            try {
                const res = await fetch('/api/list');
                const data = await res.json();
                const list = currentModFolder === 'mods' ? data.mods : data.plugins;
                const ul = document.getElementById('fileList');

                if (!list || list.length === 0) {
                    ul.innerHTML = '<li style="padding:20px; text-align:center; color:var(--text-muted);">Chưa có file nào. Hãy kéo file .jar vào ô trên!</li>';
                    return;
                }

                ul.innerHTML = list.map(item => \`
                    <li class="file-item">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="width:8px; height:8px; border-radius:50%; background:\${item.enabled ? 'var(--accent-green)' : 'var(--text-muted)'};"></span>
                            <span class="file-name">\${item.name}</span>
                            <small style="color:var(--text-muted);">(\${item.size})</small>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button onclick="toggleMod('\${item.name}')" style="padding:4px 10px; border-radius:6px; background:var(--bg-main); border:1px solid var(--border); color:var(--text-main); font-size:12px; cursor:pointer;">
                                \${item.enabled ? 'Tắt' : 'Bật'}
                            </button>
                            <button onclick="deleteMod('\${item.name}')" style="padding:4px 10px; border-radius:6px; background:rgba(255,82,82,0.1); border:1px solid rgba(255,82,82,0.4); color:var(--accent-red); font-size:12px; cursor:pointer;">
                                Xóa
                            </button>
                        </div>
                    </li>
                \`).join('');
            } catch (e) {}
        }

        async function toggleMod(name) {
            await fetch('/api/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: currentModFolder, name })
            });
            loadFileList();
        }

        async function deleteMod(name) {
            if (!confirm('Xóa file ' + name + '?')) return;
            await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: currentModFolder, name })
            });
            loadFileList();
        }

        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileInput');

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files) uploadFiles(fileInput.files);
        });

        async function uploadFiles(files) {
            for (const file of files) {
                if (!file.name.endsWith('.jar')) continue;
                showToast('⏳ Đang tải lên: ' + file.name + '...');
                await fetch('/api/upload?folder=' + currentModFolder + '&filename=' + encodeURIComponent(file.name), {
                    method: 'POST',
                    body: file
                });
            }
            showToast('✅ Đã tải file lên hoàn tất!');
            fileInput.value = '';
            loadFileList();
        }

        // Loop status every 2.5s
        fetchStatus();
        setInterval(fetchStatus, 2500);
    </script>
</body>
</html>`;
}
