import { createServer } from 'vite';
import { createApp } from './app.js';
const api = createApp().listen(3001, '127.0.0.1');
api.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});
const vite = await createServer();
await vite.listen();
vite.printUrls();
async function stop() {
  await vite.close();
  api.close();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
