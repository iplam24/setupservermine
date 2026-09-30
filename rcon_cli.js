const net = require('net');

const cmd = process.argv.slice(2).join(' ') || 'list';
const host = process.env.RCON_HOST || '127.0.0.1';
const port = parseInt(process.env.RCON_PORT || '25575', 10);
const password = process.env.RCON_PASS || 'TrumMinecraftAdmin2026';

const client = new net.Socket();
client.setTimeout(5000);
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
    const resType = data.readInt32LE(8);
    const body = data.subarray(12, data.length - 2).toString('utf-8');

    if (!authenticated) {
        if (resId === -1) {
            client.destroy();
            console.error('RCON Authentication Failed');
            process.exit(1);
        }
        authenticated = true;
        sendPacket(2, 2, cmd);
        return;
    }

    responseData += body;
    clearTimeout(client.responseTimer);
    client.responseTimer = setTimeout(() => {
        if (responseData.trim()) {
            console.log(responseData.trim());
        } else {
            console.log('(Command executed with no output)');
        }
        client.destroy();
        process.exit(0);
    }, 500);
});

client.on('timeout', () => {
    client.destroy();
    console.error('RCON Timeout');
    process.exit(1);
});

client.on('error', (err) => {
    console.error('RCON Error:', err.message);
    process.exit(1);
});
