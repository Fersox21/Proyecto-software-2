// Carga las variables del archivo .env en process.env
process.loadEnvFile();

console.log("--> Intentando conectar con:", {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  pass: process.env.PGPASSWORD, // ¡Ojo aquí para ver qué contraseña lee!
  database: process.env.PGDATABASE
});

export const env = {
  PORT: process.env.PORT ?? 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  PGHOST: process.env.PGHOST ?? 'localhost',
  PGPORT: process.env.PGPORT ?? 5432,
  PGUSER: process.env.PGUSER ?? 'postgres',
  PGPASSWORD: process.env.PGPASSWORD ?? 'admin',
  PGDATABASE: process.env.PGDATABASE ?? 'distribuidora',
};
