import { Pool, PoolClient } from 'pg';

export default function createPool(database: string): void {
   if (global.pool) {
      global.pool.end();
   }

   global.pool = new Pool({
      host: 'greenwich.lbd.dcc.ufmg.br',
      database,
      port: 5432,

      user: 'geosql',
      password: 'ge0sq1',
   });

   global.pool.on('error', (err: Error, client: PoolClient) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
   });
}
