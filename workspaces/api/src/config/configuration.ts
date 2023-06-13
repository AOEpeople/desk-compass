import * as process from 'process';

export default () => ({
  devMode: !!process.env.DEV_MODE,
  appPort: process.env.APP_PORT ?? 3030,
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')
      : [],
    allowedMethods: process.env.CORS_ALLOWED_METHODS
      ? process.env.CORS_ALLOWED_METHODS.split(',')
      : ['GET', 'PUT', 'POST', 'DELETE'],
  },
  imageStoragePath: process.env.IMAGE_STORAGE_PATH,
  database: {
    path: process.env.DATABASE_PATH,
    humanReadable: process.env.DATABASE_HUMAN_READABLE == 'true',
  },
});
