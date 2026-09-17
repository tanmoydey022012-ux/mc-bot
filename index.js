const CONFIG = {
  host: process.env.SERVER_HOST || 'OwnServer-WKpp.aternos.me',
  port: parseInt(process.env.SERVER_PORT) || 48825,
  username: process.env.BOT_NAME || 'Bot',
  offline: true,
  skipPing: true,
  version: '1.26.50', // Updated from 1.26.40 to match your server
  raknetBackend: 'jsp-raknet',
  useNativeRakNet: false
};
