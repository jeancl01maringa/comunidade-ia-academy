const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
    console.log('Client :: ready');
    conn.exec(`
    echo "=== PROCURANDO PACKAGE.JSON ==="
    find /home -name package.json
    
    echo "=== PROCURANDO PM2 ==="
    find / -name pm2 -type f -executable 2>/dev/null
  `, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).connect({
    host: '137.184.200.145',
    port: 22,
    username: 'root',
    password: 'academy@2026'
});
