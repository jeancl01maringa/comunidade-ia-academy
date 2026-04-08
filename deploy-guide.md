# Guia de Deploy DigitalOcean - IAACADEMY

Este guia descreve os passos para colocar o projeto online em um Droplet Ubuntu 22.04 na DigitalOcean.

## 1. Preparação do Servidor

No terminal do seu Droplet:

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

## 2. Configuração do Projeto

```bash
# Clone o repositório (ou transfira os arquivos)
# git clone <seu-repositorio>
# cd <diretorio-do-projeto>/web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# EDITE O .ENV COM SUAS CREDENCIAIS REAIS (Supabase, NextAuth, etc.)
# nano .env
```

## 3. Build e Execução

```bash
# Rodar migrações do banco (Prisma)
npx prisma generate
npx prisma db push # Use com cautela se for DB com dados reais

# Gerar o build de produção
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js

# Garantir que o PM2 inicie no boot
pm2 save
pm2 startup
# (Execute o comando que o pm2 startup retornará)
```

## 4. Nginx (Reverse Proxy)

Recomendado para usar SSL e apontar seu domínio.

```bash
sudo apt install nginx -y

# Criar config do Nginx
sudo nano /etc/nginx/sites-available/ia-academy
```

Cole a configuração básica:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar e testar
sudo ln -s /etc/nginx/sites-available/ia-academy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```
