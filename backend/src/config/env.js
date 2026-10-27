// Carga las variables del archivo .env en process.env
try {
  process.loadEnvFile();
} catch (error) {

}

export const env = {
  PORT: process.env.PORT ?? 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  PGHOST: process.env.PGHOST ?? '127.0.0.1',
  PGPORT: process.env.PGPORT ?? 5432,
  PGUSER: process.env.PGUSER ?? 'postgres',
  PGPASSWORD: process.env.PGPASSWORD ?? 'admin',
  PGDATABASE: process.env.PGDATABASE ?? 'distribuidora',

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
};
