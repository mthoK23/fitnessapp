import { createApp } from './app.js';
const production = process.env.NODE_ENV === 'production';
const appOrigin = process.env.APP_ORIGIN || process.env.RENDER_EXTERNAL_URL;
if (production && !appOrigin?.startsWith('https://'))
  throw new Error('Production requires an HTTPS APP_ORIGIN.');
const options = {
  production,
  ...(process.env.DATA_DIR ? { dataDir: process.env.DATA_DIR } : {}),
  ...(appOrigin ? { origins: [appOrigin] } : {}),
};
const server = createApp(options).listen(
  Number(process.env.PORT || 3001),
  process.env.HOST || '127.0.0.1',
  () =>
    console.log(
      `FitTrack server: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 3001}`,
    ),
);
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
