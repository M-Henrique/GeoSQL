import { Pool, PoolClient } from 'pg';

export let pool = new Pool({
   host: 'greenwich.lbd.dcc.ufmg.br',
   database: 'brasil',
   port: 5432,

   user: 'geosql',
   password: 'ge0sq1',
});

export let geomColumns = ['geom'];

export function changePool(database: string): void {
   if (pool) pool.end();

   pool = new Pool({
      host: 'greenwich.lbd.dcc.ufmg.br',
      database,
      port: 5432,

      user: 'geosql',
      password: 'ge0sq1',
   });

   pool.on('error', (err: Error, client: PoolClient) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
   });
}

export function changeGeomColumns(newGeomColumns: string[]): void {
   geomColumns = newGeomColumns;
}
