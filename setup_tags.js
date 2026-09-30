const net = require('net');

function sendRcon(cmd, timeout = 4000) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.setTimeout(timeout);
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

        client.connect(25575, '127.0.0.1', () => {
            sendPacket(1, 3, 'TrumMinecraftAdmin2026');
        });

        client.on('data', (data) => {
            if (data.length < 12) return;
            const resId = data.readInt32LE(4);

            if (!authenticated) {
                if (resId === -1) {
                    client.destroy();
                    return reject(new Error('RCON Auth failed'));
                }
                authenticated = true;
                sendPacket(2, 2, cmd);
                return;
            }

            const body = data.subarray(12, data.length - 2).toString('utf-8');
            responseData += body;
            clearTimeout(client.timer);
            client.timer = setTimeout(() => {
                client.destroy();
                resolve(responseData.trim());
            }, 600);
        });

        client.on('timeout', () => {
            client.destroy();
            resolve(responseData.trim());
        });

        client.on('error', (err) => {
            reject(err);
        });
    });
}

const tags = [
    { id: 'gaychua', name: 'Gầy Chúa', prefix: '&c[&6Gầy Chúa&c] ', weight: 100 },
    { id: 'xuongsuon', name: 'Xương Sườn', prefix: '&f[&7Xương Sườn&f] ', weight: 90 },
    { id: 'giobay', name: 'Gió Bay', prefix: '&b[&3Gió Bay&b] ', weight: 80 },
    { id: 'nghiennang', name: 'Nghiện Nặng', prefix: '&e[&6Nghiện Nặng&e] ', weight: 70 },
    { id: 'ta40kg', name: 'Tạ 40kg', prefix: '&a[&2Tạ 40kg&a] ', weight: 60 },
    { id: 'quetam', name: 'Que Tăm', prefix: '&e[&6Que Tăm&e] ', weight: 50 },
    { id: 'khangkhiu', name: 'Khẳng Khiu', prefix: '&d[&5Khẳng Khiu&d] ', weight: 40 },
    { id: 'dabocxuong', name: 'Da Bọc Xương', prefix: '&7[&8Da Bọc Xương&7] ', weight: 30 }
];

async function run() {
    console.log('--- Setting up LuckPerms Tag Groups ---');
    for (const tag of tags) {
        // Create group
        console.log(`Creating group: ${tag.id}`);
        let r1 = await sendRcon(`luckperms:lp creategroup ${tag.id}`);
        if (r1) console.log(`  -> ${r1}`);

        // Set prefix
        console.log(`Setting prefix for ${tag.id}: ${tag.prefix}`);
        let r2 = await sendRcon(`luckperms:lp group ${tag.id} meta setprefix ${tag.weight} "${tag.prefix}"`);
        if (r2) console.log(`  -> ${r2}`);
    }

    console.log('--- Done Setting up Tags ---');
}

run().catch(console.error);
