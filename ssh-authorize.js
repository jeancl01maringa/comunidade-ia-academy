const { spawn } = require('child_process');

const password = '34035fd7af61bacfb8cd125686';
const host = '137.184.200.145';
const command = `mkdir -p ~/.ssh && echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCn4GczEwC2jfqDIdjnCyRW/31M4ZZczC5EggPI7hIHTZild8whTh2EJjsCizVHFzKu1N8LRIasxmxQ4MsrmKRoj7svNuHTQaKBKEW5tUSju621ypTNldLvNQnXBZthHd7R15r+vPXnCFC8lDF7Z15V6+ArcSckxhF3d7PPSVdnmqoi1zx5nEKhB60lY0TV96YFr52KjCtCXEhDUpO7zjhUonlCjiEGBrzwKDQRdb5Q/Mbf8ZUwjuXumSystmBs3tzEFqiC92plquLqalZPn8vIx0E7igoq6BCVIAaYyOaeyGyG3JbCn36qshR676RArFavztWG7rNVkcZeEMqQlhXZePhIZJRejBh6E9XFM9nKXcPaP2YttOaopUagnovampyoxBsyg09g5B/hz20yMCwSaKZfLQ76La0skWft9qjyE8w186m3JRDhbE2mYnFm55bYdstjsDZl5A0f/xJGN+vWadpDAKhHxsnOvT2gMcQOSr0jRcMWYfqXKXRNa7lo9S/RIOnYQoK1AGr59bdAHoEMKYABPQXjTBI2TI/ifrRmXbrQfYFOZqnNNOslCZ0fn2/E2++wfe4520Tc1nLf9DrJ/OtaU9U5tLQETJcDnbJ9Bo25rEsYsjqLptAmPwmuzCgipRlR+5oEomTmAf+YTs8wktyzLCOWkwh6CPxGFp2C2Q== jeanm@SUPERMAQUINA" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`;

console.log('Iniciando conexão SSH...');

// Usando o comando ssh padrão do Windows
const ssh = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-o', 'BatchMode=no', `root@${host}`, command], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
});

// Enviando a senha quando solicitado (ou após um pequeno delay)
setTimeout(() => {
    console.log('Enviando senha...');
    ssh.stdin.write(password + '\n');
}, 3000);

ssh.on('close', (code) => {
    console.log(`Processo finalizado com código ${code}`);
});
