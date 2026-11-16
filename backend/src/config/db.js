import pkg from 'pg';
import { env } from './env.js';

const { Pool, types } = pkg;

types.setTypeParser(1700, (val) => parseFloat(val));

const esConexionLocal = !env.DATABASE_URL || env.DATABASE_URL.includes('localhost') || env.DATABASE_URL.includes('127.0.0.1');

const poolConfig = env.DATABASE_URL
  ? {
      connectionString: env.DATABASE_URL,
      ...(esConexionLocal ? {} : { ssl: { rejectUnauthorized: false } }),
    }
  : {
      host: env.PGHOST || 'localhost',
      port: Number(env.PGPORT) || 5432,
      user: env.PGUSER || 'postgres',
      password: env.PGPASSWORD,
      database: env.PGDATABASE || 'distribuidora',
    };

// Pool de conexiones
export const pool = new Pool({
  ...poolConfig,
  max: 20, // cantidad máxima de clientes (conexiones) simultáneas en el pool
  min: 0, // cantidad mínima de clientes que se mantienen abiertos en el pool
  idleTimeoutMillis: 30000, // ms que una conexión inactiva puede quedar abierta antes de cerrarse
  connectionTimeoutMillis: 5000, // ms de espera para establecer una conexión antes de fallar
  query_timeout: 10000, // ms máximo de espera por la respuesta de una query (lado cliente)
  statement_timeout: 10000, // ms máximo que el servidor Postgres deja correr una sentencia SQL
  allowExitOnIdle: false, // si está en true, permite que el proceso de Node termine cuando el pool queda vacío e inactivo
});

// Log de errores de conexiones inactivas que el servidor puede cerrar inesperadamente
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones', err);
});
