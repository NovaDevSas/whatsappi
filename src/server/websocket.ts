import { Server } from 'socket.io';
import { createServer } from 'http';
import { Pool } from 'pg';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);
  
  // Set up PostgreSQL connection for notifications
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  });

  // Set up PostgreSQL notification listener
  pool.connect().then(client => {
    console.log('Connected to PostgreSQL for notifications');
    
    // Listen for notifications on the 'new_message' channel
    client.query('LISTEN new_message');
    
    client.on('notification', async (msg) => {
      try {
        // The payload contains the new message data
        const payload = JSON.parse(msg.payload || '{}');
        console.log('New message notification:', payload);
        
        // Emit the new message to all connected clients
        io.emit('new_message', payload);
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    });
    
    client.on('error', (err) => {
      console.error('PostgreSQL notification error:', err);
      // Try to reconnect
      setTimeout(() => {
        // Use release() instead of end() for PoolClient
        client.release();
        pool.connect().then(newClient => {
          newClient.query('LISTEN new_message');
        });
      }, 5000);
    });
  });

  // WebSocket connection handler
  io.on('connection', (socket) => {
    console.log('Client connected to WebSocket');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});