import { Pool } from 'pg';

const pool = new Pool({
   host: 'greenwich.lbd.dcc.ufmg.br',
   database: 'brasil',
   port: 5432,

   user: 'geosql',
   password: 'ge0sq1',

   max: 20,
   idleTimeoutMillis: 100000000,
});

pool.on('error', (err, client) => {
   console.error('Unexpected error on idle client', err);
   process.exit(-1);
});

export default pool;
