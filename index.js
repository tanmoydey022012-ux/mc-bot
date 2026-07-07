const bedrock = require('bedrock-protocol');

const serverOptions = {
  host: 'OwnServer-WKpp.aternos.me', 
  port: 48825, // Make sure this matches your active Aternos port right now!                     
  username: 'Bot_Name',             
  version: '1.26.30', 
  offline: true                         
};

const client = bedrock.createClient(serverOptions);

client.on('spawn', () => {
  console.log('Bot_Name has successfully joined via Cloud Hosting!');

  // Anti-AFK Chat Loop: Sends a message every 3 minutes to maintain the connection
  setInterval(() => {
    if (client.status === 'playing' || client.status === 2) {
      console.log('Sending anti-kick chat packet...');
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: client.username,
        xuid: '',
        platform_chat_id: '',
        message: 'Standing still from the cloud! 🤖'
      });
    }
  }, 180000); 
});

client.on('error', (err) => console.error('Connection Error:', err));
client.on('disconnect', (packet) => console.log('Disconnected. Reason:', packet.message));
